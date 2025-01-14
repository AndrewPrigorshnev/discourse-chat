import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { IMAGES_EXTENSIONS_REGEX } from "discourse/lib/uploads";

export default Component.extend({
  IMAGE_TYPE: "image",

  tagName: "",
  classNames: "chat-upload",
  isDone: false,
  upload: null,
  onCancel: null,

  @discourseComputed("upload.extension")
  type(extension) {
    if (IMAGES_EXTENSIONS_REGEX.test(extension)) {
      return this.IMAGE_TYPE;
    }
  },

  @discourseComputed("isDone", "upload.{original_filename,fileName}")
  fileName(isDone, upload) {
    return isDone ? upload.original_filename : upload.fileName;
  },
});
