# frozen_string_literal: true

class ChatAllowUploadsValidator
  def initialize(opts = {})
    @opts = opts
  end

  def valid_value?(value)
    if value == "t" && prevent_enabling_chat_uploads?
      return false
    end
    true
  end

  def error_message
    if prevent_enabling_chat_uploads?
      I18n.t("site_settings.errors.chat_upload_not_allowed_secure_media")
    end
  end

  def prevent_enabling_chat_uploads?
    SiteSetting.secure_media && !GlobalSetting.allow_unsecure_chat_uploads
  end
end
