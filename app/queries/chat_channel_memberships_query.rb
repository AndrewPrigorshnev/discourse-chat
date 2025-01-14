# frozen_string_literal: true

class ChatChannelMembershipsQuery
  def self.call(channel, limit: 50, offset: 0, username: nil)
    query =
      UserChatChannelMembership
        .joins(:user)
        .includes(:user)
        .where(user: User.activated.not_suspended.not_staged)
        .where(chat_channel: channel, following: true)

    if channel.category_channel? && channel.read_restricted? && channel.allowed_group_ids
      query =
        query.where(
          "user_id IN (SELECT user_id FROM group_users WHERE group_id IN (?))",
          channel.allowed_group_ids,
        )
    end

    if username.present?
      if SiteSetting.prioritize_username_in_ux || !SiteSetting.enable_names
        query = query.where("users.username_lower ILIKE ?", "%#{username}%")
      else
        query =
          query.where(
            "LOWER(users.name) ILIKE ? OR users.username_lower ILIKE ?",
            "%#{username}%",
            "%#{username}%",
          )
      end
    end

    if SiteSetting.prioritize_username_in_ux || !SiteSetting.enable_names
      query = query.order("users.username_lower ASC")
    else
      query = query.order("users.name ASC, users.username_lower ASC")
    end

    query.offset(offset).limit(limit)
  end
end
