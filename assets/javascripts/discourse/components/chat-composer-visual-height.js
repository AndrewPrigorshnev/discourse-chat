import { bind } from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { throttle } from "@ember/runloop";

const CSS_VAR = "--chat-composer-vh";

export default class ChatComposerVisualHeight extends Component {
  tagName = "";

  didInsertElement() {
    this._super(...arguments);

    this.setVH();

    window.addEventListener("resize", this.setVHThrottler, false);

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        this.setVHThrottler,
        false
      );
    }
  }

  willDestroyElement() {
    this._super(...arguments);

    window.removeEventListener("resize", this.setVHThrottler);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", this.setVHThrottler);
    }
  }

  @bind
  setVH() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    const composerVH =
      (window.visualViewport?.height || window.innerHeight) * 0.01;
    document.documentElement.style.setProperty(CSS_VAR, `${composerVH}px`);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.body.scrollTop = 0;
      });
    });
  }

  @bind
  setVHThrottler() {
    throttle(this, this.setVH, 100);
  }
}
