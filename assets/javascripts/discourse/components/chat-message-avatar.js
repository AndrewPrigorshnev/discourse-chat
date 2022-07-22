import Component from "@ember/component";
import { computed } from "@ember/object";

export default class ChatMessageAvatar extends Component {
  tagName = "";

  didInsertElement() {
    this._super(...arguments);
    this.message.user.trackStatus();
  }

  willDestroyElement() {
    this._super(...arguments);
    this.message.user.stopTrackingStatus();
  }

  @computed("message.user.status")
  get showStatus() {
    return !!this.message.user.status;
  }
}
