<template>
  <div class="wrapper container-fluid">
    <h1 class="title">Read History</h1>
    <div class="row" id="content">
      <div class="col-2 date-range">
<!--        show the last week-->
        <div @click="loadList(null)" class="date" :class="!current_date ? 'active' : ''">All</div>
        <div v-for="(date,i ) in date_range" @click="loadList(date)" class="date" :class="current_date == date ? 'active' : ''">{{date}}</div>
      </div>
      <div class="col-3">
        <div class="articles">
          <div class="article" v-for="(article,i) in articles" @click="loadArticle(article)">
<!--            <a :href="article.url" target="article-content">{{article.title}}</a>-->
            <span class="title">{{article.title}}</span>
<!--            <span class="highlight">{{article.highlight}}</span>-->
            <span class="date">{{article.ts}}</span>
            <hr>
          </div>
          <div class="article" v-if="articles.length < 1" >
            No Articles!
          </div>
        </div>

      </div>
      <div class="col-7">
        <div class="article-content" v-html="article_content"></div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      active: true,
      articles: [],
      article_content: null,
      date_range: [],
      current_date: null
    }
  },
  created() {
    console.log("vue created =====")
  },
  mounted() {
    var that = this
    axios.get("http://localhost:4567/articles").then(function(res){
      console.log(res.data);
      that.articles = res.data
    })
    var today = new Date()
    for (var i=0; i<7; i++) {
      var date = new Date(today.getTime() - 3600 * 1000 * 24 * i);
      this.date_range.push(date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate());
    }
  },
  methods: {
    loadList(date) {
      var that = this
      this.current_date = date
      axios.get("http://localhost:4567/articles"+ (date ? "?date="+date : "")).then(function(res){
        console.log(res.data);
        that.articles = res.data
      })
    },
    loadArticle(article){
      var that = this
      axios.get(article.url).then(function(res){
        // console.log(res.data);
        let html = res.data
        if (article.highlight != null){
          let words = article.highlight.split(",")
          words = Array.from(new Set(words))
          for (var i=0; i<words.length; i++) {
            let keyword = words[i]
            html = html.split(keyword).join("<span class='jr-highlight-yellow'>" + keyword + "</span>")
          }
        }

        that.article_content = html
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
