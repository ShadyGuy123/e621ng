<template>
    <div>
        <div v-show="loading">Fetching tags...</div>
        <div class="related-tags flex-wrap">
            <div class="related-items" v-for="sTags, i in splitTags" :key="i">
                <tag-preview v-for="tag, $idx in sTags" :key="$idx" :tag="tag"></tag-preview>
            </div>
        </div>
        <div>
            <a href="#" @click.prevent="close">Close Preview</a>
        </div>
    </div>
</template>

<script>
  import Vue from 'vue';

  const tagPreviewTag = Vue.extend({
    functional: true,
    props: ['tag'],
    render: function (h, ctx) {
      function create_tag_link(name, tagType) {
        return h('a', {
            staticClass: 'tag-type-' + tagType,
            attrs: { href: "/wiki_pages/show_or_new?title=" + name, target: "_blank" }
          }, name);
      }
      var tag = ctx.props.tag;
      switch (tag.type) {
        default:
        case 'tag':
          return h('span', {staticClass: 'tag-preview'}, [create_tag_link(tag.a, tag.tagTypeA)]);
        case 'alias':
          return h('span', {staticClass: 'tag-preview tag-preview-alias'}, [
            h('del', undefined, [
              create_tag_link(tag.a, tag.tagTypeA)
            ]), ' → ', create_tag_link(tag.b, tag.tagTypeB)
          ]);
        case 'implication':
          return h('span', {staticClass: 'tag-preview tag-preview-implication'}, [
            create_tag_link(tag.a, tag.tagTypeA), ' ⇐ ', create_tag_link(tag.b, tag.tagTypeB)
          ]);
      }
    }
  });

  export default {
    props: ['tags', 'loading'],
    components: {
      'tag-preview': tagPreviewTag
    },
    methods: {
      close: function () {
        this.$emit('close');
      }
    },
    computed: {
      splitTags: function () {
        var newTags = this.tags.concat([]);
        newTags.sort(function (a, b) {
          return a.a === b.a ? 0 : (a.a < b.a ? -1 : 1);
        });
        var chunkArray = function (arr, size) {
          var chunks = [];
          for (var i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
          }
          return chunks;
        };
        return chunkArray(newTags, 15);
      }
    }
  }
</script>
