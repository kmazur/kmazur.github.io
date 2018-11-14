---
layout: post
author: kmazur
toc: true
tags: post youtube
---


<div id="tag-cloud">
    {{ site | tag_cloud }}
</div>

A banana is an edible fruit – botanically a berry – produced by several kinds
of large herbaceous flowering plants in the genus Musa.

In some countries, bananas used for cooking may be called "plantains",
distinguishing them from dessert bananas. The fruit is variable in size, color,
and firmness, but is usually elongated and curved, with soft flesh rich in
starch covered with a rind, which may be green, yellow, red, purple, or brown
when ripe.

<div style="width: 100%;">
{% youtube "https://www.youtube.com/watch?v=dxzBZpzzzo8" %}
</div>

{% figure test jpg,png 'Test file figure' %}

{% if site.related_posts.size >= 1 %}
<div>
  <h3>Related Posts</h3>
  <ul>
  {% for related_post in site.related_posts limit: 5 %}
    <li><a href="{{ related_post.url }}">{{ related_post.title }}</a></li>
  {% endfor %}
  </ul>
</div>
{% endif %}

