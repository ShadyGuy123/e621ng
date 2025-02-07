import Utility from './utility';
import Post from './posts';

let RelatedTag = {};

RelatedTag.initialize_all = function() {
  $(document).on("click.danbooru", ".related-tags-button", RelatedTag.on_click_related_tags_button);
  $(document).on("click.danbooru", ".related-tags a.search-tag", RelatedTag.toggle_tag);
  $(document).on("click.danbooru", "#show-related-tags-link", RelatedTag.show);
  $(document).on("click.danbooru", "#hide-related-tags-link", RelatedTag.hide);
  $(document).on("keyup.danbooru.relatedTags", "#upload_tag_string, #post_tag_string", RelatedTag.update_selected);

  $(document).on("danbooru:open-post-edit-dialog", RelatedTag.hide);
  $(document).on("danbooru:close-post-edit-dialog", RelatedTag.show);

  // Show the related tags automatically when the "Edit" tab is opened, or by default on the uploads page.
  $(document).on("danbooru:open-post-edit-tab", RelatedTag.show);
  $(document).on("danbooru:open-post-edit-tab", RelatedTag.init_post_show_editor);
}

import TagEditor from './tag_editor.vue';
import Vue from 'vue';

RelatedTag.tag_editor_setup = false;
RelatedTag.init_post_show_editor = function() {
  if (RelatedTag.tag_editor_setup)
    return;
  RelatedTag.tag_editor_setup = true;
  const app = new Vue({
    render: (h) => h(TagEditor)
  });

  app.$mount('#tag-string-editor');
  setTimeout(function() {
    // Work around that browsers seem to take a few frames to acknowledge that the element is there before it can be focused.
    const el = app.$children[0].$refs['otherTags'];
    el.style.height = el.scrollHeight + "px";
    el.focus();
    el.scrollIntoView();
  }, 20);
}

RelatedTag.on_click_related_tags_button = function (event) {
  RelatedTag.show();
}

RelatedTag.current_tag = function() {
  // 1. abc def |  -> def
  // 2. abc def|   -> def
  // 3. abc de|f   -> def
  // 4. abc |def   -> def
  // 5. abc| def   -> abc
  // 6. ab|c def   -> abc
  // 7. |abc def   -> abc
  // 8. | abc def  -> abc

  var $field = $("#upload_tag_string,#post_tag_string");
  var string = $field.val();
  var n = string.length;
  var a = $field.prop('selectionStart');
  var b = $field.prop('selectionStart');

  if ((a > 0) && (a < (n - 1)) && (!/\s/.test(string[a])) && (/\s/.test(string[a - 1]))) {
    // 4 is the only case where we need to scan forward. in all other cases we
    // can drag a backwards, and then drag b forwards.

    while ((b < n) && (!/\s/.test(string[b]))) {
      b++;
    }
  } else if (string.search(/\S/) > b) { // case 8
    b = string.search(/\S/);
    while ((b < n) && (!/\s/.test(string[b]))) {
      b++;
    }
  } else {
    while ((a > 0) && ((/\s/.test(string[a])) || (string[a] === undefined))) {
      a--;
      b--;
    }

    while ((a > 0) && (!/\s/.test(string[a - 1]))) {
      a--;
      b--;
    }

    while ((b < (n - 1)) && (!/\s/.test(string[b]))) {
      b++;
    }
  }

  b++;
  return string.slice(a, b);
}

RelatedTag.update_selected = function(e) {
  var current_tags = $("#upload_tag_string,#post_tag_string").val().toLowerCase().match(/\S+/g) || [];
  var $all_tags = $(".related-tags a.search-tag");
  $all_tags.removeClass("selected");

  $all_tags.each(function(i, tag) {
    if (current_tags.indexOf(tag.textContent.replace(/ /g, "_")) > -1) {
      $(tag).addClass("selected");
    }
  });
}

RelatedTag.tags_include = function(name) {
  var current = $("#upload_tag_string,#post_tag_string").val().toLowerCase().match(/\S+/g) || [];
  return $.inArray(name.toLowerCase(), current) > -1;
}

RelatedTag.toggle_tag = function(e) {
  var $field = $("#upload_tag_string,#post_tag_string");
  var tag = $(e.target).html().replace(/ /g, "_").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");

  if (RelatedTag.tags_include(tag)) {
    var escaped_tag = Utility.regexp_escape(tag);
    $field.val($field.val().replace(new RegExp("(^|\\s)" + escaped_tag + "($|\\s)", "gi"), "$1$2"));
  } else {
    $field.val($field.val() + " " + tag);
  }
  $field.val($field.val().trim().replace(/ +/g, " ") + " ");

  RelatedTag.update_selected();

  // The timeout is needed on Chrome since it will clobber the field attribute otherwise
  setTimeout(function () { $field.prop('selectionStart', $field.val().length);}, 100);
  e.preventDefault();

  Post.update_tag_count({ target: $field });
}

RelatedTag.show = function(e) {
  $(document).trigger("danbooru:show-related-tags");
  $("#related-tags-container").removeClass("hidden").addClass("visible");

  if (e) {
    e.preventDefault();
  }
}

RelatedTag.hide = function(e) {
  $("#related-tags-container").removeClass("visible").addClass("hidden");

  if (e) {
    e.preventDefault();
  }
}

$(function() {
  RelatedTag.initialize_all();
});

export default RelatedTag
