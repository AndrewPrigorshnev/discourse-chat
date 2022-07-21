import Component from "@ember/component";
import { isEmpty } from "@ember/utils";
import { action, computed } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";

export default class ChatChannelPreviewCard extends Component {
  tagName = "";

  @service chat;

  channel = null;

  @readOnly("channel.isOpen") showJoinButton;

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
