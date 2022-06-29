import ChatChannel from "discourse/plugins/discourse-chat/discourse/models/chat-channel";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { action } from "@ember/object";

export default class ChatDraftChannelScreen extends Component {
  tagName = "";
  onSwitchChannel = null;
  @service chat;

  @action
  onChangeSelectedUsers(users) {
    this._fetchPreviewedChannel(users);
  }

  @action
  onSwitchFromDraftChannel(channel) {
    channel.set("isDraft", false);
    this.onSwitchChannel?.(channel);
  }

  _formatUsernames(users = []) {
    return users.mapBy("username").uniq().join(",");
  }

  _fetchPreviewedChannel(users) {
    this.set("previewedChannel", null);

    return this.chat
      .getDmChannelForUsernames(this._formatUsernames(users))
      .then((response) => {
        this.set(
          "previewedChannel",
          ChatChannel.create(
            Object.assign({}, response.chat_channel, { isDraft: true })
          )
        );
      })
      .catch((error) => {
        if (error?.jqXHR?.status === 404) {
          this.set(
            "previewedChannel",
            ChatChannel.create({
              chatable: { users },
              isDraft: true,
            })
          );
        }
      });
  }
}