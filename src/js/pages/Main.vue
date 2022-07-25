<template>
  <div class="wrapper container-fluid">
    <h1 class="title">Read History</h1>
    <div class="row" id="content">
      <div class="col-1 date-range">
        <!--        show the last week-->
        <div @click="loadList(null)" class="date" :class="!current_date ? 'active' : ''">All</div>
        <div v-for="(date,i ) in date_range" @click="loadList(date)" class="date"
             :class="current_date == date ? 'active' : ''">{{ date }}
        </div>
      </div>
      <div class="col-3">
        <div class="loading" v-if="loading_list">Loading...</div>
        <div class="articles" v-else>
          <div v-for="(article,i) in articles" class="article" :class="current_article.id == article.id ? 'active' : ''"
               @click="loadArticle(article)">
            <!--            <a :href="article.url" target="article-content">{{article.title}}</a>-->
            <span class="title">{{ article.title }}</span>
            <!--            <span class="highlight">{{article.highlight}}</span>-->
            <span class="date">{{ article.ts }}</span>
            <hr>
          </div>
          <div class="article" v-if="articles.length < 1">
            No Articles!
          </div>
        </div>

      </div>
      <div class="col-5">
        <div v-if="loading_content" class="loading">Loading</div>
        <div v-else id="article-content" v-html="article_content"></div>
        <button id="article-save-btn" class="btn btn-danger" @click="saveArticle">Save{{saving ? "..." : ""}}</button>
      </div>
      <vocabulary-master class="col-3">
      </vocabulary-master>
<!--      <div class="col-2">-->
<!--        -->
<!--      </div>-->
    </div>
    <edit-bar v-if="show_edit_bar"
              :style="edit_bar_pos"
              :show_text_colors="show_text_colors"
              :show_bg_colors="show_bg_colors"
              @jr-bold="editAction('jr-bold')"
              @jr-italics="editAction('jr-italics')"
              @jr-underl="editAction('jr-underl')"
              @jr-strike="editAction('jr-strike')"
              @jr-text-color="editAction('jr-text-color')"
              @jr-highlight-color="editAction('jr-highlight-color')"
              @jr-remove-styles="editAction('jr-remove-styles')"
              @text-color="clickTextColor"
              @hightlight-color="clickHighlightColor"
    />
  </div>
</template>
<script>
import axios from 'axios';
import EditBar from "./components/EditBar";
import VocabularyMaster from "./components/VocabularyMaster";

const rangyOptions = {exclusive: false};
export default {
  components: {"edit-bar": EditBar, "vocabulary-master": VocabularyMaster},
  data() {
    return {
      active: true,
      articles: [],
      article_content: null,
      date_range: [],
      loading_content: false,
      loading_list: false,
      saving: false,
      current_date: null,
      current_article: {},
      show_edit_bar: false,
      edit_bar_pos: "",
      highlighter: null,
      show_text_colors: false,
      show_bg_colors: false,
    }
  },
  created() {
    console.log("vue created =====")
  },
  mounted() {
    var that = this
    axios.get("http://localhost:4567/articles").then(function (res) {
      console.log(res.data);
      that.articles = res.data
    })
    var today = new Date()
    for (var i = 0; i < 7; i++) {
      var date = new Date(today.getTime() - 3600 * 1000 * 24 * i);
      this.date_range.push(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
    }

    document.addEventListener("mouseup", this.mouseupHandler)
  },
  methods: {
    initHighlighter() {
      this.highlighter = rangy.createHighlighter(document.getElementById("simple-article"));

      const rangeOptions = {
        onElementCreate: elem => {
          elem.id = 'jr-' + Date.now();
          // hasSavedLink = false;
          // shareDropdown.classList.remove("active");
          // setTimeout(() => updateSavedVersion(), 10);
        }
      };

      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-yellow", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-blue", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-green", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-pink", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-purple", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-orange", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-highlight-red", rangeOptions));

      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-white", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-black", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-yellow", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-blue", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-green", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-pink", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-purple", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-orange", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-color-red", rangeOptions));

      this.highlighter.addClassApplier(rangy.createClassApplier("jr-strike-through", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-underline", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-italicize", rangeOptions));
      this.highlighter.addClassApplier(rangy.createClassApplier("jr-bolden", rangeOptions));
    },
    editAction(e, c) {
      console.log("======= get action: " + e + ", "+c)
      switch (e) {
        case "jr-bold":
          this.highlighter.highlightSelection("jr-bolden", rangyOptions);
          break;
        case "jr-italics":
          this.highlighter.highlightSelection("jr-italicize", rangyOptions);
          break;
        case "jr-underl":
          this.highlighter.highlightSelection("jr-underline", rangyOptions);
          break;
        case "jr-strike":
          highlighter.highlightSelection("jr-strike-through", rangyOptions);
          break;
        case "jr-text-color":
          this.show_text_colors = true
          this.show_bg_colors = false
          break;
        case "jr-highlight-color":
          this.show_text_colors = false
          this.show_bg_colors = true
          break;
        case "jr-remove-styles":
          break;
        case "hightlight-color":
          break;
        default:
          break;
      }
    },
    clickTextColor(color){
      console.log("click text color: "+color)
      this.highlighter.highlightSelection("jr-color-" + color, rangyOptions);
    },
    clickHighlightColor(color) {
      console.log("click highlight color: "+color)
      this.highlighter.highlightSelection("jr-highlight-" + color, { exclusive: true });
    },
    saveArticle(){
      // var content = document.getElementById("article-content").outerHTML
      this.saving = true
      axios.post("http://localhost:4567/articles/"+this.current_article.id+"/content", {
        content: document.getElementById("article-content").outerHTML.toString()
      }).then(res => {
        console.log(res.data)
        this.saving = false
      })
    },
    mouseupHandler(e) {
      if (!this.highlighter) {
        this.initHighlighter()
      }
      var sel = rangy.getSelection().toString();
      if (!sel) {
        this.show_edit_bar = false
        return
      }
      this.show_text_colors = false
      this.show_bg_colors = false
      console.log("=== mouse up, selection: " + sel)
      const r = rangy.getSelection().nativeSelection.getRangeAt(0).getBoundingClientRect();
      const top = (r.top + document.defaultView.pageYOffset - 60) + 'px';
      const left = (r.left + r.width / 2 + document.defaultView.pageXOffset - 105) + 'px';

      this.show_edit_bar = true
      this.edit_bar_pos = "display:block; top: " + top + "; left: " + left;
    },
    loadList(date) {
      var that = this
      this.current_date = date
      this.loading_list = true
      axios.get("http://localhost:4567/articles" + (date ? "?date=" + date : "")).then(function (res) {
        console.log(res.data);
        that.articles = res.data
        that.loading_list = false
      })
    },
    loadArticle(article) {
      var that = this
      this.loading_content = true
      this.current_article = article
      axios.get(article.url+"?t="+Math.random()).then(function (res) {
        // console.log(res.data);
        let html = res.data
        if (article.highlight != null) {
          let words = article.highlight.split(",")
          words = Array.from(new Set(words))
          for (var i = 0; i < words.length; i++) {
            let keyword = words[i]
            html = html.split(keyword).join("<span class='jr-highlight-yellow'>" + keyword + "</span>")
          }
        }

        that.article_content = html
        that.loading_content = false
      })
    }
  }
}
</script>

<style lang="css" scoped>
@import "../../css/bootstrap5.min.css";
@import "../../css/bootstrap5-grid.min.css";
</style>


<style lang="scss" scopped>
@import "../../scss/main";
</style>
