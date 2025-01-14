import Component from "@ember/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class ChatChannelAboutView extends Component {
  tagName = "";
  channel = null;
  onEditChatChannelTitle = null;
  onEditChatChannelDescription = null;
  isLoading = false;

  @service chat;

  @action
  afterMembershipToggle() {
    this.chat.forceRefreshChannels().then(() => {
      this.chat.openChannel(this.channel);
    });
  }
}
