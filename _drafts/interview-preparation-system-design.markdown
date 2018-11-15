---
layout: post
author: kmazur
toc: true
tags: interview system-design
---

# Interview preparation - system design

1. Think broadly
2. Split into components
3. Consider scalability
4. User

Examples design:
- google suggest
- gmail
- building access system
- shopping feeds system


# Resources

- [Software Engineering Advice from Building Large-scale Distributed Systems](http://static.googleusercontent.com/media/research.google.com/en/us/people/jeff/stanford-295-talk.pdf)
- [ULSS](http://en.wikipedia.org/wiki/Ultra-large-scale_systems#Characteristics_of_an_ultra-large-scale_system)
- [Five Considerations For Large Scale Systems](https://sites.google.com/site/craigandera/craigs-stuff/scalability-considerations/five-considerations-for-large-scale-systems)
- [System Design Interview for IT company](https://github.com/checkcheckzz/system-design-interview)
- [Hired in Tech - System Design](https://www.hiredintech.com/system-design)
- [Example of a coding interview](https://www.youtube.com/watch?v=XKu_SEDAykw&feature=em-subs_digest)
- [How to prepare for a technical interview](https://www.youtube.com/watch?v=ko-KkSmp-Lk)



# TODO
- https://www.hiredintech.com/system-design
- https://www.hiredintech.com/classrooms/system-design/lesson/60

Study case studies from AWS
- https://aws.amazon.com/solutions/case-studies/airbnb/?pg=main-customer-success-page
- https://aws.amazon.com/solutions/case-studies/intuit-cloud-migration/
- https://aws.amazon.com/solutions/case-studies/johnson-and-johnson/
- https://aws.amazon.com/solutions/case-studies/nasa-jpl-curiosity/?pg=main-customer-success-page
- https://aws.amazon.com/solutions/case-studies/netflix/?pg=main-customer-success-page
- https://aws.amazon.com/blogs/architecture/
- IntensiveApps - Twitter example on 1st chapter

- https://d0.awsstatic.com/whitepapers/architecture/AWS_Well-Architected_Framework.pdf

- http://web.mit.edu/2.75/resources/random/How%20Complex%20Systems%20Fail.pdf

- http://www.aosabook.org/en/distsys.html
- https://everythingisdata.wordpress.com/2009/10/17/numbers-everyone-should-know/
- https://pages.cs.wisc.edu/~zuyu/files/fallacies.pdf
- http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html
- https://lethain.com/introduction-to-architecting-systems-for-scale/
- https://queue.acm.org/detail.cfm?id=1594206
- https://www.youtube.com/watch?v=srOgpXECblk



System design interview - solve all in the email: Design: Google SUggest, gmail(back/from-end), building access system, shopping feeds system

Prepare and learn by heart checklist on system design interview questions to myself

- http://static.googleusercontent.com/media/research.google.com/en/us/people/jeff/stanford-295-talk.pdf
- http://en.wikipedia.org/wiki/Ultra-large-scale_systems#Characteristics_of_an_ultra-large-scale_system
- https://sites.google.com/site/craigandera/craigs-stuff/scalability-considerations/five-considerations-for-large-scale-systems
- https://www.hiredintech.com/system-design
- https://d0.awsstatic.com/whitepapers/architecture/AWS_Well-Architected_Framework.pdf
- Write down intensive apps concepts
- https://github.com/binhnguyennus/awesome-scalability

- https://www.safaribooksonline.com/library/view/microservices-best-practices/9780738442273/
- https://docs.cloudfoundry.org/devguide/deploy-apps/prepare-to-deploy.html
- https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html?fbclid=IwAR3PB8YyICUEDK0dJbnaQplUApP31sQzgZvqWQDS04pTkyMYLxFDlCCcCmM

- http://www.kegel.com/c10k.html
- https://www.microsoft.com/en-us/research/uploads/prod/2016/12/paxos-simple-Copy.pdf
- http://www.tom-e-white.com/2007/11/consistent-hashing.html
- http://horicky.blogspot.com/2009/11/nosql-patterns.html


- How does NTP work exactly?
- What are Cassandra use cases?
- What are Flink use cases?



TODO:
The paper trail:
- https://www.the-paper-trail.org/post/2014-06-25-the-elephant-was-a-trojan-horse-on-the-death-of-map-reduce-at-google/
- https://www.the-paper-trail.org/post/2014-06-04-paper-notes-stream-processing-at-google-with-millwheel/
- https://www.the-paper-trail.org/post/2013-01-30-columnar-storage/
- https://www.the-paper-trail.org/post/2012-11-03-on-some-subtleties-of-paxos/
- https://www.the-paper-trail.org/post/2012-01-04-how-consistent-is-eventual-consistency/
- https://www.the-paper-trail.org/post/2009-02-09-consensus-protocols-a-paxos-implementation/
- https://www.the-paper-trail.org/post/2009-02-03-consensus-protocols-paxos/
- https://www.the-paper-trail.org/post/2008-11-29-consensus-protocols-three-phase-commit/
- https://www.the-paper-trail.org/post/2008-11-27-consensus-protocols-two-phase-commit/
- https://www.the-paper-trail.org/post/2008-10-29-bigtable-googles-distributed-data-store/
- https://www.the-paper-trail.org/post/2008-10-01-the-google-file-system/
- https://www.the-paper-trail.org/post/2008-08-26-consistency-and-availability-in-amazons-dynamo/
- https://www.the-paper-trail.org/post/2008-04-09-reservoir-sampling/


ACM queue:
- https://queue.acm.org/detail.cfm?id=3280677 How to Get Things Done When You Don't Feel Like It
- https://queue.acm.org/detail.cfm?id=3287302 Using Remote Cache Service for Bazel
- https://queue.acm.org/detail.cfm?id=2801719 Crash Consistency
- https://queue.acm.org/detail.cfm?id=2800697 Testing a Distributed System
- https://queue.acm.org/detail.cfm?id=2884038 Immutability Changes Everything
- https://queue.acm.org/detail.cfm?id=2878574 Time is an illusion
- https://queue.acm.org/detail.cfm?id=2889274 The Verification of a Distributed System
- https://queue.acm.org/detail.cfm?id=3074451 Research for Practice: Tracing and Debugging Distributed Systems; Programming by Examples
- https://queue.acm.org/detail.cfm?id=3055303 Making Money Using Math
- https://queue.acm.org/detail.cfm?id=3096459 The Calculus of Service Availability
- https://queue.acm.org/detail.cfm?id=3203214 How to Come Up with Great Ideas
- https://queue.acm.org/detail.cfm?id=3194655 Canary Analysis Service
- https://queue.acm.org/detail.cfm?id=3197520 Manual Work is a Bug
- https://queue.acm.org/detail.cfm?id=3220266 Algorithms Behind Modern Storage Systems
- https://queue.acm.org/detail.cfm?id=3226077 Consistently Eventual
- https://queue.acm.org/detail.cfm?id=3283589 Why SRE Documents Matter
- https://queue.acm.org/detail.cfm?id=3287302 Using Remote Cache Service for Bazel
- https://queue.acm.org/detail.cfm?id=2371516 Weathering the Unexpected. Failures happen, and resilience drills help organizations prepare for them


- http://betathoughts.blogspot.com/2007/06/brief-history-of-consensus-2pc-and.html