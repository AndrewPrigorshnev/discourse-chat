import Component from "@ember/component";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { isEmpty } from "@ember/utils";
import ChatApi from "discourse/plugins/discourse-chat/discourse/lib/chat-api";
import { action, computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default class ChatChannelPreviewCard extends Component {
  tagName = "";

  @service chat;

  channel = null;

  @computed("channel.description")
  get hasDescription() {
    return !isEmpty(this.channel.description);
  }

  @computed("hasDescription")
  get cardClasses() {
    return `chat-channel-preview-card ${
      !this.hasDescription ? "chat-channel-preview-card--no-description" : ""
    }`.trim();
  }

  @action
  afterMembershipToggle() {
    this.chat.forceRefreshChannels().then(() => {
      this.chat.openChannel(this.channel);
    });
  }
}
