import { set } from "@ember/object";
import componentTest, {
  setupRenderingTest,
} from "discourse/tests/helpers/component-test";
import { exists, visible } from "discourse/tests/helpers/qunit-helpers";
import hbs from "htmlbars-inline-precompile";
import ChatChannel from "discourse/plugins/discourse-chat/discourse/models/chat-channel";
import { click } from "@ember/test-helpers";
import { module } from "qunit";

module(
  "Discourse Chat | Component | chat-composer attachments test",
  function (hooks) {
    setupRenderingTest(hooks);

    componentTest(
      "Allow attachments setting doesn't apply to direct message channels",
      {
        template: hbs`{{chat-composer chatChannel=chatChannel canInteractWithChat=true}}`,
        beforeEach() {
          set(this.currentUser, "id", 1);
          this.set(
            "chatChannel",
            ChatChannel.create({
              chatable_type: "DirectMessageChannel",
              chatable: {
                users: [{ id: 1 }],
              },
            })
          );
          this.siteSettings.chat_allow_uploads = false;
        },
        async test(assert) {
          await click(".chat-composer-dropdown__trigger-btn");

          assert.ok(
            visible(".chat-composer-dropdown__action-btn.chat-upload-btn")
          );
        },

        skip: true, // this should be an acceptance test
      }
    );

    componentTest("Allow attachments setting applies to public channels", {
      template: hbs`{{chat-composer chatChannel=chatChannel canInteractWithChat=true}}`,

      beforeEach() {
        set(this.currentUser, "id", 1);
        this.set(
          "chatChannel",
          ChatChannel.create({
            chatable_type: "Category",
            chatable: {},
          })
        );
        this.siteSettings.chat_allow_uploads = false;
      },

      async test(assert) {
        // Toolbar button isn't present because there are no buttons to be rendered
        assert.notOk(exists(".open-toolbar-btn"));
      },
    });
  }
);
