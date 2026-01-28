---
show: true
width: 4
date: 2021-09-12 00:01:00 +0800
height: 295px
images:
- src: ./assets/images/photos/Liverpool.jpg
  title: Liverpool
  desc: 
- src: ./assets/images/photos/kunmingpool.jpg
  title: Kunming Pool
  desc: 
- src: https://picsum.photos/seed/third33/800/800
---

{% include widgets/carousel.html id=page.id images=page.images height=page.height %}
