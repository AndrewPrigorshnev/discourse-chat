# frozen_string_literal: true

class ChatChannel < ActiveRecord::Base
  include Trashable
  belongs_to :chatable, polymorphic: true
  belongs_to :direct_message_channel,
             -> { where(chat_channels: { chatable_type: "DirectMessageChannel" }) },
             foreign_key: "chatable_id"

  has_many :chat_messages
  has_many :user_chat_channel_memberships

  has_one :chat_channel_archive

  enum status: { open: 0, read_only: 1, closed: 2, archived: 3 }, _scopes: false

  validates :name,
            length: {
              maximum: Proc.new { SiteSetting.max_topic_title_length },
            },
            presence: true,
            allow_nil: true

  def membership_for(user)
    user_chat_channel_memberships.find_by(user: user)
  end

  def add(user)
    ActiveRecord::Base.transaction do
      membership =
        UserChatChannelMembership.find_or_initialize_by(user_id: user.id, chat_channel: self)

      if !membership.following
        update!(user_count: (user_count || 0) + 1)
        membership.following = true
        membership.save!
      end

      membership
    end
  end

  def remove(user)
    ActiveRecord::Base.transaction do
      membership = UserChatChannelMembership.find_by!(user_id: user.id, chat_channel: self)

      if membership.following
        new_user_count = [(user_count || 0) - 1, 0].max
        update!(user_count: new_user_count)
        membership.update!(following: false)
      end

      membership
    end
  end

  def open?
    self.status.to_sym == :open
  end

  def read_only?
    self.status.to_sym == :read_only
  end

  def closed?
    self.status.to_sym == :closed
  end

  def archived?
    self.status.to_sym == :archived
  end

  def status_name
    I18n.t("chat.channel.statuses.#{self.status}")
  end

  def url
    "#{Discourse.base_url}/chat/channel/#{self.id}/-"
  end

  def chatable_url
    return nil if direct_message_channel?

    chatable.url
  end

  def category_channel?
    chatable_type == "Category"
  end

  def direct_message_channel?
    chatable_type == "DirectMessageChannel"
  end

  def public_channel?
    ChatChannel.public_channel_chatable_types.include?(chatable_type)
  end

  def chatable_has_custom_fields?
    category_channel?
  end

  def allowed_user_ids
    direct_message_channel? ? chatable.user_ids : nil
  end

  def allowed_group_ids
    return if !category_channel?
    return if category_channel? && !read_restricted?

    staff_groups = Group::AUTO_GROUPS.slice(:staff, :moderators, :admins).values
    chatable.secure_group_ids.to_a.concat(staff_groups)
  end

  def public_channel_title
    chatable.name
  end

  def read_restricted?
    return true if direct_message_channel?
    return chatable.read_restricted? if category_channel?

    true
  end

  def title(user)
    return chatable.chat_channel_title_for_user(self, user) if direct_message_channel?
    return name if name.present?

    title_from_chatable
  end

  def title_from_chatable
    case chatable_type
    when "Category"
      chatable.name
    when "DirectMessageChannel"
      chatable.chat_channel_title_for_user(self, user)
    end
  end

  def change_status(acting_user, target_status)
    return if !ChatChannel.statuses.include?(target_status.to_s)
    return if !Guardian.new(acting_user).can_change_channel_status?(self, target_status)
    old_status = self.status
    self.update!(status: target_status)
    log_channel_status_change(
      acting_user: acting_user,
      new_status: target_status,
      old_status: old_status,
    )
  end

  def open!(acting_user)
    change_status(acting_user, :open)
  end

  def read_only!(acting_user)
    change_status(acting_user, :read_only)
  end

  def closed!(acting_user)
    change_status(acting_user, :closed)
  end

  def archived!(acting_user)
    change_status(acting_user, :archived)
  end

  def self.chatable_types
    public_channel_chatable_types << "DirectMessageChannel"
  end

  def self.public_channel_chatable_types
    ["Category"]
  end

  def self.public_channels
    where(chatable_type: public_channel_chatable_types).where("categories.id IS NOT NULL").joins(
      "LEFT JOIN categories ON categories.id = chat_channels.chatable_id AND chat_channels.chatable_type = 'Category'",
    )
  end

  private

  def log_channel_status_change(acting_user:, new_status:, old_status:)
    new_status = new_status.to_sym
    old_status = old_status.to_sym

    DiscourseEvent.trigger(
      :chat_channel_status_change,
      channel: self,
      old_status: old_status,
      new_status: new_status,
    )

    StaffActionLogger.new(acting_user).log_custom(
      "chat_channel_status_change",
      {
        chat_channel_id: self.id,
        chat_channel_name: self.name,
        previous_value: old_status,
        new_value: new_status,
      },
    )

    ChatPublisher.publish_channel_status(self)
  end
end

# == Schema Information
#
# Table name: chat_channels
#
#  id                      :bigint           not null, primary key
#  chatable_id             :integer          not null
#  deleted_at              :datetime
#  deleted_by_id           :integer
#  featured_in_category_id :integer
#  delete_after_seconds    :integer
#  chatable_type           :string           not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  name                    :string
#  description             :text
#  status                  :integer          default("open"), not null
#  user_count              :integer          default(0), not null
#  last_message_sent_at    :datetime         not null
#  auto_join_users         :boolean          default(FALSE), not null
#
# Indexes
#
#  index_chat_channels_on_chatable_id                    (chatable_id)
#  index_chat_channels_on_chatable_id_and_chatable_type  (chatable_id,chatable_type)
#  index_chat_channels_on_status                         (status)
#
