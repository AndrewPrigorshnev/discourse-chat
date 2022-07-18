import Component from "@ember/component";
import ChatApi from "discourse/plugins/discourse-chat/discourse/lib/chat-api";
import discourseComputed from "discourse-common/utils/decorators";
import I18n from "I18n";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

const NOTIFICATION_LEVELS = [
  { name: I18n.t("chat.notification_levels.never"), value: "never" },
  { name: I18n.t("chat.notification_levels.mention"), value: "mention" },
  { name: I18n.t("chat.notification_levels.always"), value: "always" },
];

const MUTED_OPTIONS = [
  { name: I18n.t("chat.settings.muted_on"), value: true },
  { name: I18n.t("chat.settings.muted_off"), value: false },
];

export default Component.extend({
  channel: null,
  loading: false,
  showSaveSuccess: false,
  notificationLevels: NOTIFICATION_LEVELS,
  mutedOptions: MUTED_OPTIONS,
  chat: service(),
  router: service(),

  didInsertElement() {
    this._super(...arguments);
  },

  @discourseComputed("channel.chatable_type")
  chatChannelClass(channelType) {
    return `${channelType.toLowerCase()}-chat-channel`;
  },

  @action
  previewChannel() {
    this.chat.openChannel(this.channel);
  },
});
