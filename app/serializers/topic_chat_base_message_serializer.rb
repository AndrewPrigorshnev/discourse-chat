# frozen_string_literal: true

class TopicChatBaseMessageSerializer < ApplicationSerializer
  attributes :id,
    :message,
    :post_id,
    :created_at,
    :in_reply_to_id,
    :deleted_at,
    :deleted_by_id,
    :flag_count

  # handled in subclasses
  #has_one :user, serializer: BasicUserSerializer, root: :users

  def include_deleted_at?
    !object.deleted_at.nil?
  end

  def include_deleted_by_id?
    !object.deleted_at.nil?
  end

  def include_in_reply_to_id?
    object.in_reply_to_id.presence
  end

  def flag_count
    0 # TODO: flagging
    # object.flag_count / ReviewableSomethingOrOther
  end

  def include_flag_count?
    scope.can_see_flags?(object.topic) && (false && object.flag_count > 0)
  end
end