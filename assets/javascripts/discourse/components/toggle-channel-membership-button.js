import Component from "@ember/component";
import I18n from "I18n";
import { inject as service } from "@ember/service";
import { popupAjaxError } from "discourse/lib/ajax-error";
import ChatApi from "discourse/plugins/discourse-chat/discourse/lib/chat-api";
import { action, computed } from "@ember/object";

export default class ToggleChannelMembershipButton extends Component {
  @service chat;
  tagName = "";

  channel = null;
  onToggle = null;
  options = null;

  isLoading = false;

  init() {
    super.init(...arguments);
    this.set(
      "options",
      Object.assign(
        {
          labelType: "normal",
          joinTitle: I18n.t("chat.channel_settings.join_channel"),
          joinIcon: "",
          joinClass: "",
          leaveTitle: I18n.t("chat.channel_settings.leave_channel"),
          leaveIcon: "",
          leaveClass: "",
        },
        this.options || {}
      )
    );
  }

  @computed("channel.following")
  get label() {
    if (this.options.labelType === "none") {
      return "";
    }

    if (this.options.labelType === "short") {
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

        this.channel.updateMembership(true, membership);
        this.chat.startTrackingChannel(this.channel);
        this.onToggle?.();
      })
      .catch(popupAjaxError);
  }

  @action
  onLeaveChannel() {
    this.set("isLoading", true);

    return ChatApi.unfollowChatChannel(this.channel.id)
      .then((membership) => {
        this.set("isLoading", false);

        this.channel.updateMembership(false, membership);
        this.chat.stopTrackingChannel(this.channel);
        this.onToggle?.();
      })
      .catch(popupAjaxError);
  }
}
