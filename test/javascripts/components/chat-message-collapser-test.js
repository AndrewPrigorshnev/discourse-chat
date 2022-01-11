import componentTest, {
  setupRenderingTest,
} from "discourse/tests/helpers/component-test";
import hbs from "htmlbars-inline-precompile";
import {
  discourseModule,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";

discourseModule(
  "Discourse Chat | Component | chat message collapser youtube",
  function (hooks) {
    setupRenderingTest(hooks);
    const youtubeCooked =
      '<div class="onebox lazyYT lazyYT-container" data-youtube-id="WaT_rLGuUr8" data-youtube-title="Japanese Katsu Curry (Pork Cutlet)"/>';

    componentTest("shows youtube link in header", {
      template: hbs`{{chat-message-collapser cooked=cooked}}`,

      beforeEach() {
        this.set("cooked", youtubeCooked);
      },

      async test(assert) {
        const link = query(".chat-message-collapser-link");

        assert.ok(link);
        assert.strictEqual(
          link.href,
          "https://www.youtube.com/watch?v=WaT_rLGuUr8"
        );
      },
    });

    componentTest("does not show filename since it's not an image", {
      template: hbs`{{chat-message-collapser cooked=cooked}}`,

      beforeEach() {
        this.set("cooked", youtubeCooked);
      },

      async test(assert) {
        assert.notOk(exists(".chat-message-collapser-filename"));
      },
    });

    componentTest("collapses and expands cooked youtube", {
      template: hbs`{{chat-message-collapser cooked=cooked}}`,

      beforeEach() {
        this.set("cooked", youtubeCooked);
      },

      async test(assert) {
        const youtubeDivSelector = ".onebox.lazyYT";

        assert.ok(exists(youtubeDivSelector));

        await click(".chat-message-collapser-open");

        assert.notOk(exists(youtubeDivSelector));

        await click(".chat-message-collapser-close");

        assert.ok(exists(youtubeDivSelector));
      },
    });
  }
);

discourseModule(
  "Discourse Chat | Component | chat message collapser images",
  function (hooks) {
    setupRenderingTest(hooks);
    const imageCooked = "<p>A picture of Tomtom</p>";

    componentTest("shows filename for one image", {
      template: hbs`{{chat-message-collapser cooked=cooked uploads=uploads}}`,

      beforeEach() {
        this.set("cooked", imageCooked);
        this.set("uploads", [{ original_filename: "tomtom.jpeg" }]);
      },

      async test(assert) {
        assert.strictEqual(
          query(".chat-message-collapser-filename").innerText.trim(),
          "tomtom.jpeg"
        );
      },
    });

    componentTest("shows number of files for multiple images", {
      template: hbs`{{chat-message-collapser cooked=cooked uploads=uploads}}`,

      beforeEach() {
        this.set("cooked", imageCooked);
        this.set("uploads", [{}, {}]);
      },

      async test(assert) {
        assert.strictEqual(
          query(".chat-message-collapser-filename").innerText.trim(),
          "2 files"
        );
      },
    });

    componentTest("does not show link in header since it's not youtube", {
      template: hbs`{{chat-message-collapser cooked=cooked uploads=uploads}}`,

      beforeEach() {
        this.set("cooked", imageCooked);
        this.set("uploads", [{}, {}]);
      },

      async test(assert) {
        assert.notOk(exists(".chat-message-collapser-link"));
      },
    });

    componentTest("collapses and expands images", {
      template: hbs`{{chat-message-collapser cooked=cooked uploads=uploads}}`,

      beforeEach() {
        this.set("cooked", imageCooked);
        this.set("uploads", [{ extension: "png" }]);
      },

      async test(assert) {
        const uploads = ".chat-uploads";
        const chatImageUpload = ".chat-img-upload";

        assert.ok(exists(uploads));
        assert.ok(exists(chatImageUpload));

        await click(".chat-message-collapser-open");

        assert.notOk(exists(uploads));
        assert.notOk(exists(chatImageUpload));

        await click(".chat-message-collapser-close");

        assert.ok(exists(uploads));
        assert.ok(exists(chatImageUpload));
      },
    });
  }
);

discourseModule(
  "Discourse Chat | Component | chat message collapser animated image",
  function (hooks) {
    setupRenderingTest(hooks);
    const escapedMessage = "http://gif.com/1/g.w?cid=1&amp;id=gif.web&amp;ct=g";
    const message = "http://gif.com/1/g.w?cid=1&id=gif.web&ct=g";
    const animatedImageCooked = `<p><img src="${escapedMessage}" class="animated onebox"></img></p>`;
    const unescapedAnimatedImageCooked =
      '<p><img src="someurl" class="animated onebox"></img></p>';
    const notOneboxAnimatedImageCooked =
      '<p><img src="someurl" class="animated onebo"></img></p>';

    componentTest("shows link for animated image", {
      template: hbs`{{chat-message-collapser cooked=cooked message=message}}`,

      beforeEach() {
        this.set("cooked", animatedImageCooked);
        this.set("message", message);
      },

      async test(assert) {
        assert.strictEqual(
          query("a.chat-message-collapser-filename").innerText.trim(),
          message
        );
        assert.strictEqual(
          query("a.chat-message-collapser-filename").href,
          message
        );
      },
    });

    componentTest("does not show message for malicious cooked message", {
      template: hbs`{{chat-message-collapser cooked=cooked message=message}}`,

      beforeEach() {
        this.set("cooked", unescapedAnimatedImageCooked);
        this.set("message", message);
      },

      async test(assert) {
        assert.notOk(exists(".chat-message-collapser-filename"));
      },
    });

    componentTest("does not show message for non-onebox cooked message", {
      template: hbs`{{chat-message-collapser cooked=cooked message=message}}`,

      beforeEach() {
        this.set("cooked", notOneboxAnimatedImageCooked);
        this.set("message", message);
      },

      async test(assert) {
        assert.notOk(exists(".chat-message-collapser-filename"));
      },
    });

    componentTest("collapses and expands animated image", {
      template: hbs`{{chat-message-collapser cooked=cooked message=message}}`,

      beforeEach() {
        this.set("cooked", animatedImageCooked);
        this.set("message", message);
      },

      async test(assert) {
        const onebox = ".animated.onebox";

        assert.ok(exists(onebox));

        await click(".chat-message-collapser-open");

        assert.notOk(exists(onebox));

        await click(".chat-message-collapser-close");

        assert.ok(exists(onebox));
      },
    });
  }
);