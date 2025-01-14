# frozen_string_literal: true

class DeletedChatUser < User
  def username
    I18n.t("chat.deleted_chat_username")
  end

  def avatar_template
    "/plugins/discourse-chat/images/deleted-chat-user-avatar.png"
  end
end
