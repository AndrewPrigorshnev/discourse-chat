import Component from "@ember/component";
import I18n from "I18n";
import { inject as service } from "@ember/service";
import { popupAjaxError } from "discourse/lib/ajax-error";
import ChatApi from "discourse/plugins/discourse-chat/discourse/lib/chat-api";
import { action, computed } from "@ember/object";

export default class ChatToggleMembershipBtn extends Component {
  @service chat;
  tagName = "";

  channel = null;
  afterToggle = null;
  isLoading = false;
  labelType = null;
  joinTitle = null;
  joinIcon = null;
  joinClasses = "";
  leaveTitle = null;
  leaveIcon = null;
  leaveClasses = "";

  @computed("channel.following")
  get label() {
    if (this.labelType === "none") {
      return "";
    }

    if (this.labelType === "short") {
      if (this.channel.following) {
        return I18n.t("chat.channel_settings.leave");
      } else {
        return I18n.t("chat.channel_settings.join");
      }
    }

    if (this.channel.following) {
      return I18n.t("chat.channel_settings.leave_channel");
    } else {
      return I18n.t("chat.channel_settings.join_channel");
    }
  }

  @action
  onJoinChannel() {
    this.set("isLoading", true);

    return ChatApi.followChatChannel(this.channel.id)
      .then((membership) => {
        this.set("isLoading", false);

        this.channel.setProperties({
          following: true,
          muted: membership.muted,
          desktop_notification_level: membership.desktop_notification_level,
          mobile_notification_level: membership.mobile_notification_level,
          memberships_count: membership.user_count,
        });

        this.chat.startTrackingChannel(this.channel);

        if (this.afterToggle) {
          this.afterToggle();
        }
      })
      .catch(popupAjaxError);
  }

  @action
  onLeaveChannel() {
    this.set("isLoading", true);

    return ChatApi.unfollowChatChannel(this.channel.id)
      .then((membership) => {
        this.set("isLoading", false);

        this.channel.setProperties({
          expanded: false,
          following: false,
          memberships_count: membership.user_count,
        });

        this.chat.stopTrackingChannel(this.channel);

        if (this.afterToggle) {
          this.afterToggle();
        }
      })
      .catch(popupAjaxError);
  }
}
