---
layout: post
author: kmazur
toc: true
title: From jdk8 to jdk12
cssId: jdk
tags: java jdk jdk8 jdk9 jdk10 jdk11 jdk12
jsarr:
 - moment.min.js
---

<script>

const getFeatureTags = (elem) => elem.dataset.tags.split(' ').map(t => t.toLowerCase())

const getButtonGroup = () => document.getElementById("filter");
const getAllFeatures = () => [...document.querySelectorAll(".feature")];
const getAllTags     = () => Array.from(new Set(getAllFeatures()
                                 .map(f => getFeatureTags(f))
                                 .reduce((x,y) => x.concat(y), [])))
                                 .filter(tag => tag.trim().length > 0);
const getActiveTags  = () => [...getButtonGroup().children]
                                 .filter(c => c.dataset.active == "true")
                                 .map(c => c.textContent);
 

function createTagButton(tag) {
    let elem = document.createElement("button");
    elem.textContent = tag.toLowerCase();
    elem.dataset.active = false;
    elem.onclick = function(e) {
        let flag = elem.dataset.active == "true";
        elem.dataset.active = !flag;
        filterFeatures();
    };
    return elem;
}

function filterFeatures() {
    let activeTags = getActiveTags();
    if(activeTags.length === 0) {
        activeTags = getAllTags();
    }
    let featureElems = getAllFeatures();
    featureElems.forEach(elem => {
        let tags = getFeatureTags(elem);
        let matchedTags = tags.filter(tag => activeTags.includes(tag));
        elem.style.display = matchedTags.length > 0 ? "block" : "none";
    });
}

window.onload = function() {
    let tags = getAllTags();
    let btnGroup = getButtonGroup();
    
    tags.map(tag => createTagButton(tag)).forEach(button => btnGroup.append(button));
    
    [...document.querySelectorAll(".timeago")].forEach(e => {
        e.textContent = "(" + moment(e.getAttribute("datetime")).fromNow() + ")";
    });
};

</script>

<div class="btn-group" id="filter">
</div>

# [JDK 8](https://openjdk.java.net/projects/jdk8/){:target="_blank"}

GA: 2014-03-18 <small class="timeago" datetime="2014-03-18"></small>

Features:

<section class="features">

<div data-jep="131" class="feature" data-component="security-libs" data-subcomponent="javax.crypto:pkcs11" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/131" target="_blank" class="jep">JEP 131</a>: <span class="jep-name">PKCS#11 Crypto Provider for 64-bit Windows</span>
    <div class="summary">Include the SunPKCS11 provider in the JDK for 64-bit Windows.</div>
    <div class="details"></div>
</div>

<div data-jep="176" class="feature" data-component="None" data-subcomponent="null" data-scope="JDK" data-tags="None">
    <a href="https://openjdk.java.net/jeps/176" target="_blank" class="jep">JEP 176</a>: <span class="jep-name">Mechanical Checking of Caller-Sensitive Methods</span>
    <div class="summary">Improve the security of the JDK's method-handle implementation by replacing the existing hand-maintained list of caller-sensitive methods with a mechanism that accurately identifies such methods and allows their callers to be discovered reliably.</div>
    <div class="details"></div>
</div>

<div data-jep="173" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/173" target="_blank" class="jep">JEP 173</a>: <span class="jep-name">Retire Some Rarely-Used GC Combinations</span>
    <div class="summary">Remove three rarely-used combinations of garbage collectors in order to reduce ongoing development, maintenance, and testing costs.</div>
    <div class="details"></div>
</div>

<div data-jep="174" class="feature" data-component="core-libs" data-subcomponent="jdk.nashorn" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/174" target="_blank" class="jep">JEP 174</a>: <span class="jep-name">Nashorn JavaScript Engine</span>
    <div class="summary">Design and implement a new lightweight, high-performance implementation of JavaScript, and integrate it into the JDK. The new engine will be made available to Java applications via the existing javax.script API, and also more generally via a new command-line tool.</div>
    <div class="details"></div>
</div>

<div data-jep="130" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/130" target="_blank" class="jep">JEP 130</a>: <span class="jep-name">SHA-224 Message Digests</span>
    <div class="summary">Implement the SHA-224 message-digest algorithm and related algorithms.</div>
    <div class="details"></div>
</div>

<div data-jep="171" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/171" target="_blank" class="jep">JEP 171</a>: <span class="jep-name">Fence Intrinsics</span>
    <div class="summary">Add three memory-ordering intrinsics to the sun.misc.Unsafe class.</div>
    <div class="details"></div>
</div>

<div data-jep="172" class="feature" data-component="tools" data-subcomponent="javadoc(tool)" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/172" target="_blank" class="jep">JEP 172</a>: <span class="jep-name">DocLint</span>
    <div class="summary">Provide a means to detect errors in Javadoc comments early in the development cycle and in a way that is easily linked back to the source code.</div>
    <div class="details"></div>
</div>

<div data-jep="170" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/170" target="_blank" class="jep">JEP 170</a>: <span class="jep-name">JDBC 4.2</span>
    <div class="summary">Minor enhancements to JDBC to improve usability and portability</div>
    <div class="details"></div>
</div>

<div data-jep="139" class="feature" data-component="tools" data-subcomponent="javac" data-scope="Implementation" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/139" target="_blank" class="jep">JEP 139</a>: <span class="jep-name">Enhance javac to Improve Build Speed</span>
    <div class="summary">Reduce the time required to build the JDK and enable incremental builds by modifying the Java compiler to run on all available cores in a single persistent process, track package and class dependences between builds, automatically generate header files for native methods, and clean up class and header files that are no longer needed.</div>
    <div class="details"></div>
</div>

<div data-jep="138" class="feature" data-component="None" data-subcomponent="null" data-scope="Implementation" data-tags="None">
    <a href="https://openjdk.java.net/jeps/138" target="_blank" class="jep">JEP 138</a>: <span class="jep-name">Autoconf-Based Build System</span>
    <div class="summary">Introduce autoconf (./configure-style) build setup, refactor the Makefiles to remove recursion, and leverage JEP 139: Enhance javac to Improve Build Speed.</div>
    <div class="details"></div>
</div>

<div data-jep="179" class="feature" data-component="None" data-subcomponent="null" data-scope="JDK" data-tags="None">
    <a href="https://openjdk.java.net/jeps/179" target="_blank" class="jep">JEP 179</a>: <span class="jep-name">Document JDK API Support and Stability</span>
    <div class="summary">There is a long-standing shortcoming in the JDK in terms of clearly specifying the support and stability usage contract for com.sun.* types and other types shipped with the JDK that are outside of the Java SE specification. These contracts and potential evolution policies should be clearly captured both in the source code of the types and in the resulting class files. This information can be modeled with JDK-specific annotation types.</div>
    <div class="details"></div>
</div>

<div data-jep="135" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/135" target="_blank" class="jep">JEP 135</a>: <span class="jep-name">Base64 Encoding & Decoding</span>
    <div class="summary">Define a standard API for Base64 encoding and decoding.</div>
    <div class="details"></div>
</div>

<div data-jep="136" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/136" target="_blank" class="jep">JEP 136</a>: <span class="jep-name">Enhanced Verification Errors</span>
    <div class="summary">Provide additional contextual information about bytecode-verification errors to ease diagnosis of bytecode or stackmap deficiencies in the field.</div>
    <div class="details"></div>
</div>

<div data-jep="177" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/177" target="_blank" class="jep">JEP 177</a>: <span class="jep-name">Optimize java.text.DecimalFormat.format</span>
    <div class="summary">Optimize java.text.DecimalFormat.format by taking advantage of numerical properties of integer and floating-point arithmetic to accelerate cases with two or three digits after the decimal point.</div>
    <div class="details"></div>
</div>

<div data-jep="133" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/133" target="_blank" class="jep">JEP 133</a>: <span class="jep-name">Unicode 6.2</span>
    <div class="summary">Extend existing platform APIs to support version 6.2 of the Unicode Standard.</div>
    <div class="details"></div>
</div>

<div data-jep="178" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/178" target="_blank" class="jep">JEP 178</a>: <span class="jep-name">Statically-Linked JNI Libraries</span>
    <div class="summary">Enhance the JNI specification to support statically linked native libraries.</div>
    <div class="details"></div>
</div>

<div data-jep="142" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/142" target="_blank" class="jep">JEP 142</a>: <span class="jep-name">Reduce Cache Contention on Specified Fields</span>
    <div class="summary">Define a way to specify that one or more fields in an object are likely to be highly contended across processor cores so that the VM can arrange for them not to share cache lines with other fields, or other objects, that are likely to be independently accessed.</div>
    <div class="details"></div>
</div>

<div data-jep="184" class="feature" data-component="core-libs" data-subcomponent="java.net" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/184" target="_blank" class="jep">JEP 184</a>: <span class="jep-name">HTTP URL Permissions</span>
    <div class="summary">Define a new type of network permission which grants access in terms of URLs rather than low-level IP addresses.</div>
    <div class="details"></div>
</div>

<div data-jep="140" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/140" target="_blank" class="jep">JEP 140</a>: <span class="jep-name">Limited doPrivileged</span>
    <div class="summary">Enable code to assert a subset of its privileges without otherwise preventing the full access-control stack walk to check for other permissions.</div>
    <div class="details"></div>
</div>

<div data-jep="185" class="feature" data-component="xml" data-subcomponent="jaxp" data-scope="SE" data-tags="xml">
    <a href="https://openjdk.java.net/jeps/185" target="_blank" class="jep">JEP 185</a>: <span class="jep-name">Restrict Fetching of External XML Resources</span>
    <div class="summary">Enhance the JAXP APIs to add the ability to restrict the set of network protocols that may be used to fetch external resources.</div>
    <div class="details"></div>
</div>

<div data-jep="180" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="Implementation" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/180" target="_blank" class="jep">JEP 180</a>: <span class="jep-name">Handle Frequent HashMap Collisions with Balanced Trees</span>
    <div class="summary">Improve the performance of java.util.HashMap under high hash-collision conditions by using balanced trees rather than linked lists to store map entries. Implement the same improvement in the LinkedHashMap class.</div>
    <div class="details"></div>
</div>

<div data-jep="106" class="feature" data-component="tools" data-subcomponent="javadoc(tool)" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/106" target="_blank" class="jep">JEP 106</a>: <span class="jep-name">Add Javadoc to javax.tools</span>
    <div class="summary">Extend the javax.tools API to provide access to javadoc.</div>
    <div class="details"></div>
</div>

<div data-jep="107" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/107" target="_blank" class="jep">JEP 107</a>: <span class="jep-name">Bulk Data Operations for Collections</span>
    <div class="summary">Add functionality to the Java Collections Framework for bulk operations upon data. This is commonly referenced as "filter/map/reduce for Java." The bulk data operations include both serial (on the calling thread) and parallel (using many threads) versions of the operations. Operations upon data are generally expressed as lambda functions.</div>
    <div class="details"></div>
</div>

<div data-jep="148" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/148" target="_blank" class="jep">JEP 148</a>: <span class="jep-name">Small VM</span>
    <div class="summary">Support the creation of a small VM that is no larger than 3MB.</div>
    <div class="details"></div>
</div>

<div data-jep="104" class="feature" data-component="specification" data-subcomponent="language" data-scope="SE" data-tags="specification">
    <a href="https://openjdk.java.net/jeps/104" target="_blank" class="jep">JEP 104</a>: <span class="jep-name">Annotations on Java Types</span>
    <div class="summary">Extend the set of annotatable locations in the syntax of the Java programming language to include names which indicate the use of a type as well as (per Java SE 5.0) the declaration of a type.</div>
    <div class="details"></div>
</div>

<div data-jep="105" class="feature" data-component="tools" data-subcomponent="javac" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/105" target="_blank" class="jep">JEP 105</a>: <span class="jep-name">DocTree API</span>
    <div class="summary">Extend the Compiler Tree API to provide structured access to the content of javadoc comments.</div>
    <div class="details"></div>
</div>

<div data-jep="149" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="Implementation" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/149" target="_blank" class="jep">JEP 149</a>: <span class="jep-name">Reduce Core-Library Memory Usage</span>
    <div class="summary">Reduce the dynamic memory used by core-library classes without adversely impacting performance.</div>
    <div class="details"></div>
</div>

<div data-jep="147" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/147" target="_blank" class="jep">JEP 147</a>: <span class="jep-name">Reduce Class Metadata Footprint</span>
    <div class="summary">Reduce HotSpot's class metadata memory footprint in order to improve performance on small devices.</div>
    <div class="details"></div>
</div>

<div data-jep="103" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/103" target="_blank" class="jep">JEP 103</a>: <span class="jep-name">Parallel Array Sorting</span>
    <div class="summary">Add additional utility methods to java.util.Arrays that use the JSR 166 Fork/Join parallelism common pool to provide sorting of arrays in parallel.</div>
    <div class="details"></div>
</div>

<div data-jep="101" class="feature" data-component="specification" data-subcomponent="language" data-scope="SE" data-tags="specification">
    <a href="https://openjdk.java.net/jeps/101" target="_blank" class="jep">JEP 101</a>: <span class="jep-name">Generalized Target-Type Inference</span>
    <div class="summary">Smoothly expand the scope of method type-inference to support (i) inference in method context and (ii) inference in chained calls.</div>
    <div class="details"></div>
</div>

<div data-jep="109" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/109" target="_blank" class="jep">JEP 109</a>: <span class="jep-name">Enhance Core Libraries with Lambda</span>
    <div class="summary">Enhance the Java core library APIs using the new lambda language feature to improve the usability and convenience of the library.</div>
    <div class="details"></div>
</div>

<div data-jep="153" class="feature" data-component="client-libs" data-subcomponent="null" data-scope="JDK" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/153" target="_blank" class="jep">JEP 153</a>: <span class="jep-name">Launch JavaFX Applications</span>
    <div class="summary">Enhance the java command-line launcher to launch JavaFX applications.</div>
    <div class="details"></div>
</div>

<div data-jep="150" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/150" target="_blank" class="jep">JEP 150</a>: <span class="jep-name">Date & Time API</span>
    <div class="summary">Define a new date, time, and calendar API for the Java SE platform.</div>
    <div class="details"></div>
</div>

<div data-jep="117" class="feature" data-component="tools" data-subcomponent="javac" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/117" target="_blank" class="jep">JEP 117</a>: <span class="jep-name">Remove the Annotation-Processing Tool (apt)</span>
    <div class="summary">Remove the apt tool, associated API, and documentation from the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="118" class="feature" data-component="specification" data-subcomponent="vm" data-scope="SE" data-tags="specification">
    <a href="https://openjdk.java.net/jeps/118" target="_blank" class="jep">JEP 118</a>: <span class="jep-name">Access to Parameter Names at Runtime</span>
    <div class="summary">Provide a mechanism to easily and reliably retrieve the parameter names of methods and constructors at runtime via core reflection.</div>
    <div class="details"></div>
</div>

<div data-jep="115" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/115" target="_blank" class="jep">JEP 115</a>: <span class="jep-name">AEAD CipherSuites</span>
    <div class="summary">Support the AEAD/GCM cipher suites defined by SP-800-380D, RFC 5116, RFC 5246, RFC 5288, RFC 5289 and RFC 5430.</div>
    <div class="details"></div>
</div>

<div data-jep="113" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/113" target="_blank" class="jep">JEP 113</a>: <span class="jep-name">MS-SFU Kerberos 5 Extensions</span>
    <div class="summary">Add the MS-SFU extensions to the JDK's Kerberos 5 implementation.</div>
    <div class="details"></div>
</div>

<div data-jep="114" class="feature" data-component="security-libs" data-subcomponent="javax.net.ssl" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/114" target="_blank" class="jep">JEP 114</a>: <span class="jep-name">TLS Server Name Indication (SNI) Extension</span>
    <div class="summary">Add support for the TLS Server Name Indication (SNI) Extension to allow more flexible secure virtual hosting and virtual-machine infrastructure based on SSL/TLS protocols.</div>
    <div class="details"></div>
</div>

<div data-jep="155" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/155" target="_blank" class="jep">JEP 155</a>: <span class="jep-name">Concurrency Updates</span>
    <div class="summary">Scalable updatable variables, cache-oriented enhancements to the ConcurrentHashMap API, ForkJoinPool improvements, and additional Lock and Future classes.</div>
    <div class="details"></div>
</div>

<div data-jep="112" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="Implementation" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/112" target="_blank" class="jep">JEP 112</a>: <span class="jep-name">Charset Implementation Improvements</span>
    <div class="summary">Improve the maintainability and performance of the standard and extended charset implementations.</div>
    <div class="details"></div>
</div>

<div data-jep="119" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/119" target="_blank" class="jep">JEP 119</a>: <span class="jep-name">javax.lang.model Implementation Backed by Core Reflection</span>
    <div class="summary">Provide an implementation of the javax.lang.model.* API backed by core reflection rather than by javac. In other words, provide an alternate API to access and process the reflective information about loaded classes provided by core reflection.</div>
    <div class="details"></div>
</div>

<div data-jep="164" class="feature" data-component="None" data-subcomponent="null" data-scope="Implementation" data-tags="None">
    <a href="https://openjdk.java.net/jeps/164" target="_blank" class="jep">JEP 164</a>: <span class="jep-name">Leverage CPU Instructions for AES Cryptography</span>
    <div class="summary">Improve the out-of-box AES Crypto performance by using x86 AES instructions when available, and by avoiding unnecessary re-expansion of the AES key.</div>
    <div class="details"></div>
</div>

<div data-jep="120" class="feature" data-component="specification" data-subcomponent="language" data-scope="SE" data-tags="specification">
    <a href="https://openjdk.java.net/jeps/120" target="_blank" class="jep">JEP 120</a>: <span class="jep-name">Repeating Annotations</span>
    <div class="summary">Change the Java programming language to allow multiple application of annotations with the same type to a single program element.</div>
    <div class="details"></div>
</div>

<div data-jep="121" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/121" target="_blank" class="jep">JEP 121</a>: <span class="jep-name">Stronger Algorithms for Password-Based Encryption</span>
    <div class="summary">Provide stronger Password-Based-Encryption (PBE) algorithm implementations in the SunJCE provider.</div>
    <div class="details"></div>
</div>

<div data-jep="162" class="feature" data-component="None" data-subcomponent="null" data-scope="SE" data-tags="None">
    <a href="https://openjdk.java.net/jeps/162" target="_blank" class="jep">JEP 162</a>: <span class="jep-name">Prepare for Modularization</span>
    <div class="summary">Undertake changes to smooth the eventual transition to modules in a future release, provide new tools to help developers prepare for the modular platform, and deprecate certain APIs that are a significant impediment to modularization.</div>
    <div class="details"></div>
</div>

<div data-jep="160" class="feature" data-component="None" data-subcomponent="null" data-scope="Implementation" data-tags="None">
    <a href="https://openjdk.java.net/jeps/160" target="_blank" class="jep">JEP 160</a>: <span class="jep-name">Lambda-Form Representation for Method Handles</span>
    <div class="summary">Improve the implementation of method handles by replacing assembly language paths with an optimizable intermediate representation and then refactoring the implementation so that more work is done in portable Java code than is hardwired into the JVM.</div>
    <div class="details"></div>
</div>

<div data-jep="161" class="feature" data-component="None" data-subcomponent="null" data-scope="SE" data-tags="None">
    <a href="https://openjdk.java.net/jeps/161" target="_blank" class="jep">JEP 161</a>: <span class="jep-name">Compact Profiles</span>
    <div class="summary">Define a few subset Profiles of the Java SE Platform Specification so that applications that do not require the entire Platform can be deployed and run on small devices.</div>
    <div class="details"></div>
</div>

<div data-jep="128" class="feature" data-component="core-libs" data-subcomponent="java.util:i18n" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/128" target="_blank" class="jep">JEP 128</a>: <span class="jep-name">Unicode BCP 47 Locale Matching</span>
    <div class="summary">Define APIs so that applications that use BCP 47 language tags (see RFC 5646) can match them to a user's language preferences in a way that conforms to RFC 4647.</div>
    <div class="details"></div>
</div>

<div data-jep="129" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/129" target="_blank" class="jep">JEP 129</a>: <span class="jep-name">NSA Suite B Cryptographic Algorithms</span>
    <div class="summary">Provide implementations of the cryptographic algorithms required by NSA Suite B.</div>
    <div class="details"></div>
</div>

<div data-jep="126" class="feature" data-component="tools" data-subcomponent="javac" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/126" target="_blank" class="jep">JEP 126</a>: <span class="jep-name">Lambda Expressions & Virtual Extension Methods</span>
    <div class="summary">Add lambda expressions (closures) and supporting features, including method references, enhanced type inference, and virtual extension methods, to the Java programming language and platform.</div>
    <div class="details"></div>
</div>

<div data-jep="127" class="feature" data-component="core-libs" data-subcomponent="java.util:i18n" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/127" target="_blank" class="jep">JEP 127</a>: <span class="jep-name">Improve Locale Data Packaging and Adopt Unicode CLDR Data</span>
    <div class="summary">Create a tool to convert LDML (Locale Data Markup Language) files into a format usable directly by the runtime library, define a way to package the results into modules, and then use these to incorporate the de-facto standard locale data published by the Unicode Consortium's CLDR project into the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="124" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/124" target="_blank" class="jep">JEP 124</a>: <span class="jep-name">Enhance the Certificate Revocation-Checking API</span>
    <div class="summary">Improve the certificate revocation-checking API to support best-effort checking, end-entity certificate checking, and mechanism-specific options and parameters.</div>
    <div class="details"></div>
</div>

<div data-jep="122" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/122" target="_blank" class="jep">JEP 122</a>: <span class="jep-name">Remove the Permanent Generation</span>
    <div class="summary">Remove the permanent generation from the Hotspot JVM and thus the need to tune the size of the permanent generation.</div>
    <div class="details"></div>
</div>

<div data-jep="166" class="feature" data-component="security-libs" data-subcomponent="null" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/166" target="_blank" class="jep">JEP 166</a>: <span class="jep-name">Overhaul JKS-JCEKS-PKCS12 Keystores</span>
    <div class="summary">Facilitate migrating data from JKS and JCEKS keystores by adding equivalent support to the PKCS#12 keystore. Enhance the KeyStore API to support new features such as entry metadata and logical views spanning several keystores. Enable the strong crypto algorithms introduced in JEP-121 to be used to protect keystore entries.</div>
    <div class="details"></div>
</div>

<div data-jep="123" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/123" target="_blank" class="jep">JEP 123</a>: <span class="jep-name">Configurable Secure Random-Number Generation</span>
    <div class="summary">Enhance the API for secure random-number generation so that it can be configured to operate within specified quality and responsiveness constraints.</div>
    <div class="details"></div>
</div>

</section>


# [JDK 9](https://openjdk.java.net/projects/jdk9/){:target="_blank"}

GA: 2017-09-21 <small class="timeago" datetime="2017-09-21"></small>

Features:

<section class="features">

<div data-jep="252" class="feature" data-component="core-libs" data-subcomponent="java.util:i18n" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/252" target="_blank" class="jep">JEP 252</a>: <span class="jep-name">Use CLDR Locale Data by Default</span>
    <div class="summary">Use locale data from the Unicode Consortium's Common Locale Data Repository (CLDR) by default.</div>
    <div class="details"></div>
</div>

<div data-jep="253" class="feature" data-component="javafx" data-subcomponent="controls" data-scope="JDK" data-tags="javafx">
    <a href="https://openjdk.java.net/jeps/253" target="_blank" class="jep">JEP 253</a>: <span class="jep-name">Prepare JavaFX UI Controls & CSS APIs for Modularization</span>
    <div class="summary">Define public APIs for the JavaFX UI controls and CSS functionality that is presently only available via internal APIs and will hence become inaccessible due to modularization.</div>
    <div class="details"></div>
</div>

<div data-jep="297" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/297" target="_blank" class="jep">JEP 297</a>: <span class="jep-name">Unified arm32/arm64 Port</span>
    <div class="summary">Integrate the unified port of HotSpot for arm32 and arm64, contributed by Oracle, into the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="250" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/250" target="_blank" class="jep">JEP 250</a>: <span class="jep-name">Store Interned Strings in CDS Archives</span>
    <div class="summary">Store interned strings in class-data sharing (CDS) archives.</div>
    <div class="details"></div>
</div>

<div data-jep="294" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/294" target="_blank" class="jep">JEP 294</a>: <span class="jep-name">Linux/s390x Port</span>
    <div class="summary">Port JDK 9 to Linux/s390x.</div>
    <div class="details"></div>
</div>

<div data-jep="251" class="feature" data-component="client-libs" data-subcomponent="2d" data-scope="SE" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/251" target="_blank" class="jep">JEP 251</a>: <span class="jep-name">Multi-Resolution Images</span>
    <div class="summary">Define a multi-resolution image API so that images with resolution variants can easily be manipulated and displayed.</div>
    <div class="details"></div>
</div>

<div data-jep="295" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/295" target="_blank" class="jep">JEP 295</a>: <span class="jep-name">Ahead-of-Time Compilation</span>
    <div class="summary">Compile Java classes to native code prior to launching the virtual machine.</div>
    <div class="details"></div>
</div>

<div data-jep="292" class="feature" data-component="core-libs" data-subcomponent="jdk.nashorn" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/292" target="_blank" class="jep">JEP 292</a>: <span class="jep-name">Implement Selected ECMAScript 6 Features in Nashorn</span>
    <div class="summary">Implement, in Nashorn, a selected set of the many new features introduced in the 6th edition of ECMA-262, also known as ECMAScript 6, or ES6 for short.</div>
    <div class="details"></div>
</div>

<div data-jep="290" class="feature" data-component="core-libs" data-subcomponent="java.io:serialization" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/290" target="_blank" class="jep">JEP 290</a>: <span class="jep-name">Filter Incoming Serialization Data</span>
    <div class="summary">Allow incoming streams of object-serialization data to be filtered in order to improve both security and robustness.</div>
    <div class="details"></div>
</div>

<div data-jep="291" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/291" target="_blank" class="jep">JEP 291</a>: <span class="jep-name">Deprecate the Concurrent Mark Sweep (CMS) Garbage Collector</span>
    <div class="summary">Deprecate the Concurrent Mark Sweep (CMS) garbage collector, with the intent to stop supporting it in a future major release.</div>
    <div class="details"></div>
</div>

<div data-jep="216" class="feature" data-component="tools" data-subcomponent="javac" data-scope="Implementation" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/216" target="_blank" class="jep">JEP 216</a>: <span class="jep-name">Process Import Statements Correctly</span>
    <div class="summary">Fix javac to properly accept and reject programs regardless of the order of import statements and extends and implements clauses.</div>
    <div class="details"></div>
</div>

<div data-jep="217" class="feature" data-component="tools" data-subcomponent="javac" data-scope="Implementation" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/217" target="_blank" class="jep">JEP 217</a>: <span class="jep-name">Annotations Pipeline 2.0</span>
    <div class="summary">Redesign the javac annotations pipeline to better address the requirements of annotations and tools that process annotations.</div>
    <div class="details"></div>
</div>

<div data-jep="214" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/214" target="_blank" class="jep">JEP 214</a>: <span class="jep-name">Remove GC Combinations Deprecated in JDK 8</span>
    <div class="summary">Remove the GC combinations that were previously deprecated in JDK 8 via JEP 173.</div>
    <div class="details"></div>
</div>

<div data-jep="258" class="feature" data-component="client-libs" data-subcomponent="2d" data-scope="Implementation" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/258" target="_blank" class="jep">JEP 258</a>: <span class="jep-name">HarfBuzz Font-Layout Engine</span>
    <div class="summary">Replace the existing ICU OpenType font-layout engine with HarfBuzz.</div>
    <div class="details"></div>
</div>

<div data-jep="215" class="feature" data-component="tools" data-subcomponent="javac" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/215" target="_blank" class="jep">JEP 215</a>: <span class="jep-name">Tiered Attribution for javac</span>
    <div class="summary">Implement a new method type-checking strategy in javac to speed up attribution of poly expression in argument position.</div>
    <div class="details"></div>
</div>

<div data-jep="259" class="feature" data-component="core-libs" data-subcomponent="null" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/259" target="_blank" class="jep">JEP 259</a>: <span class="jep-name">Stack-Walking API</span>
    <div class="summary">Define an efficient standard API for stack walking that allows easy filtering of, and lazy access to, the information in stack traces.</div>
    <div class="details"></div>
</div>

<div data-jep="212" class="feature" data-component="tools" data-subcomponent="null" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/212" target="_blank" class="jep">JEP 212</a>: <span class="jep-name">Resolve Lint and Doclint Warnings</span>
    <div class="summary">The JDK code base contains numerous lint and doclint errors as reported by javac. These warnings should be resolved, at least for the fundamental parts of the platform.</div>
    <div class="details"></div>
</div>

<div data-jep="256" class="feature" data-component="client-libs" data-subcomponent="java.beans" data-scope="JDK" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/256" target="_blank" class="jep">JEP 256</a>: <span class="jep-name">BeanInfo Annotations</span>
    <div class="summary">Replace @beaninfo Javadoc tags with proper annotations, and process those annotations at run time to generate BeanInfo classes dynamically.</div>
    <div class="details"></div>
</div>

<div data-jep="213" class="feature" data-component="tools" data-subcomponent="javac" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/213" target="_blank" class="jep">JEP 213</a>: <span class="jep-name">Milling Project Coin</span>
    <div class="summary">The small language changes included in Project Coin / JSR 334 as part of JDK 7 / Java SE 7 have been easy to use and have worked well in practice. However, a few amendments could address the rough edges of those changes. In addition, using underscore ("_") as an identifier, which generates a warning as of Java SE 8, should be turned into an error in Java SE 9. It is also proposed that interfaces be allowed to have private methods.</div>
    <div class="details"></div>
</div>

<div data-jep="257" class="feature" data-component="javafx" data-subcomponent="media" data-scope="Implementation" data-tags="javafx">
    <a href="https://openjdk.java.net/jeps/257" target="_blank" class="jep">JEP 257</a>: <span class="jep-name">Update JavaFX/Media to Newer Version of GStreamer</span>
    <div class="summary">Update the version of GStreamer included in FX/Media in order to improve security, stability, and performance.</div>
    <div class="details"></div>
</div>

<div data-jep="254" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="Implementation" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/254" target="_blank" class="jep">JEP 254</a>: <span class="jep-name">Compact Strings</span>
    <div class="summary">Adopt a more space-efficient internal representation for strings.</div>
    <div class="details"></div>
</div>

<div data-jep="298" class="feature" data-component="infrastructure" data-subcomponent="null" data-scope="JDK" data-tags="infrastructure">
    <a href="https://openjdk.java.net/jeps/298" target="_blank" class="jep">JEP 298</a>: <span class="jep-name">Remove Demos and Samples</span>
    <div class="summary">Remove the outdated and unmaintained demos and samples.</div>
    <div class="details"></div>
</div>

<div data-jep="211" class="feature" data-component="tools" data-subcomponent="javac" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/211" target="_blank" class="jep">JEP 211</a>: <span class="jep-name">Elide Deprecation Warnings on Import Statements</span>
    <div class="summary">As of Java SE 8, java compilers are required by reasonable interpretations of the Java Language Specification to issue deprecation warnings when a deprecated type is imported by name or when a deprecated member (method, field, nested type) is imported statically. These warnings are uninformative and should not be required. Deprecation warnings at actual uses of deprecated members should remain.</div>
    <div class="details"></div>
</div>

<div data-jep="255" class="feature" data-component="xml" data-subcomponent="jaxp" data-scope="JDK" data-tags="xml">
    <a href="https://openjdk.java.net/jeps/255" target="_blank" class="jep">JEP 255</a>: <span class="jep-name">Merge Selected Xerces 2.11.0 Updates into JAXP</span>
    <div class="summary">Upgrade the version of the Xerces XML parser included in the JDK with important changes from Xerces 2.11.0.</div>
    <div class="details"></div>
</div>

<div data-jep="299" class="feature" data-component="docs" data-subcomponent="null" data-scope="JDK" data-tags="docs">
    <a href="https://openjdk.java.net/jeps/299" target="_blank" class="jep">JEP 299</a>: <span class="jep-name">Reorganize Documentation</span>
    <div class="summary">Update the organization of the documents in the JDK, in both the source repositories and the generated docs.</div>
    <div class="details"></div>
</div>

<div data-jep="219" class="feature" data-component="security-libs" data-subcomponent="javax.net.ssl" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/219" target="_blank" class="jep">JEP 219</a>: <span class="jep-name">Datagram Transport Layer Security (DTLS)</span>
    <div class="summary">Define an API for Datagram Transport Layer Security (DTLS) version 1.0 (RFC 4347) and 1.2 (RFC 6347).</div>
    <div class="details"></div>
</div>

<div data-jep="263" class="feature" data-component="client-libs" data-subcomponent="java.awt" data-scope="JDK" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/263" target="_blank" class="jep">JEP 263</a>: <span class="jep-name">HiDPI Graphics on Windows and Linux</span>
    <div class="summary">Implement HiDPI graphics on Windows and Linux.</div>
    <div class="details"></div>
</div>

<div data-jep="143" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/143" target="_blank" class="jep">JEP 143</a>: <span class="jep-name">Improve Contended Locking</span>
    <div class="summary">Improve the performance of contended Java object monitors.</div>
    <div class="details"></div>
</div>

<div data-jep="220" class="feature" data-component="None" data-subcomponent="null" data-scope="SE" data-tags="None">
    <a href="https://openjdk.java.net/jeps/220" target="_blank" class="jep">JEP 220</a>: <span class="jep-name">Modular Run-Time Images</span>
    <div class="summary">Restructure the JDK and JRE run-time images to accommodate modules and to improve performance, security, and maintainability. Define a new URI scheme for naming the modules, classes, and resources stored in a run-time image without revealing the internal structure or format of the image. Revise existing specifications as required to accommodate these changes.</div>
    <div class="details"></div>
</div>

<div data-jep="264" class="feature" data-component="core-libs" data-subcomponent="java.util.logging" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/264" target="_blank" class="jep">JEP 264</a>: <span class="jep-name">Platform Logging API and Service</span>
    <div class="summary">Define a minimal logging API which platform classes can use to log messages, together with a service interface for consumers of those messages. A library or application can provide an implementation of this service in order to route platform log messages to the logging framework of its choice. If no implementation is provided then a default implementation based upon the java.util.logging API is used.</div>
    <div class="details"></div>
</div>

<div data-jep="261" class="feature" data-component="None" data-subcomponent="null" data-scope="SE" data-tags="None">
    <a href="https://openjdk.java.net/jeps/261" target="_blank" class="jep">JEP 261</a>: <span class="jep-name">Module System</span>
    <div class="summary">Implement the Java Platform Module System, as specified by JSR 376, together with related JDK-specific changes and enhancements.</div>
    <div class="details"></div>
</div>

<div data-jep="262" class="feature" data-component="client-libs" data-subcomponent="javax.imageio" data-scope="SE" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/262" target="_blank" class="jep">JEP 262</a>: <span class="jep-name">TIFF Image I/O</span>
    <div class="summary">Extend the standard set of Image I/O plugins to support the TIFF image format.</div>
    <div class="details"></div>
</div>

<div data-jep="260" class="feature" data-component="None" data-subcomponent="null" data-scope="JDK" data-tags="None">
    <a href="https://openjdk.java.net/jeps/260" target="_blank" class="jep">JEP 260</a>: <span class="jep-name">Encapsulate Most Internal APIs</span>
    <div class="summary">Encapsulate most of the JDK's internal APIs by default so that they are inaccessible at compile time, and prepare for a future release in which they will be inaccessible at run time. Ensure that critical, widely-used internal APIs are not encapsulated, so that they remain accessible until supported replacements exist for all or most of their functionality.</div>
    <div class="details"></div>
</div>

<div data-jep="227" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/227" target="_blank" class="jep">JEP 227</a>: <span class="jep-name">Unicode 7.0</span>
    <div class="summary">Upgrade existing platform APIs to support version 7.0 of the Unicode Standard.</div>
    <div class="details"></div>
</div>

<div data-jep="228" class="feature" data-component="hotspot" data-subcomponent="svc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/228" target="_blank" class="jep">JEP 228</a>: <span class="jep-name">Add More Diagnostic Commands</span>
    <div class="summary">Define additional diagnostic commands, in order to improve the diagnosability of Hotspot and the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="225" class="feature" data-component="tools" data-subcomponent="javadoc(tool)" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/225" target="_blank" class="jep">JEP 225</a>: <span class="jep-name">Javadoc Search</span>
    <div class="summary">Add a search box to API documentation generated by the standard doclet that can be used to search for program elements and tagged words and phrases within the documentation. The search box appears in the header of all pages generated by the standard doclet.</div>
    <div class="details"></div>
</div>

<div data-jep="269" class="feature" data-component="core-libs" data-subcomponent="java.util:collections" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/269" target="_blank" class="jep">JEP 269</a>: <span class="jep-name">Convenience Factory Methods for Collections</span>
    <div class="summary">Define library APIs to make it convenient to create instances of collections and maps with small numbers of elements, so as to ease the pain of not having collection literals in the Java programming language.</div>
    <div class="details"></div>
</div>

<div data-jep="226" class="feature" data-component="core-libs" data-subcomponent="java.util:i18n" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/226" target="_blank" class="jep">JEP 226</a>: <span class="jep-name">UTF-8 Property Resource Bundles</span>
    <div class="summary">Define a means for applications to specify property files encoded in UTF-8, and extend the ResourceBundle API to load them.</div>
    <div class="details"></div>
</div>

<div data-jep="102" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/102" target="_blank" class="jep">JEP 102</a>: <span class="jep-name">Process API Updates</span>
    <div class="summary">Improve the API for controlling and managing operating-system processes.</div>
    <div class="details"></div>
</div>

<div data-jep="223" class="feature" data-component="None" data-subcomponent="null" data-scope="SE" data-tags="None">
    <a href="https://openjdk.java.net/jeps/223" target="_blank" class="jep">JEP 223</a>: <span class="jep-name">New Version-String Scheme</span>
    <div class="summary">Define a version-string scheme that easily distinguishes major, minor, and security-update releases, and apply it to the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="267" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/267" target="_blank" class="jep">JEP 267</a>: <span class="jep-name">Unicode 8.0</span>
    <div class="summary">Upgrade existing platform APIs to support version 8.0 of the Unicode Standard.</div>
    <div class="details"></div>
</div>

<div data-jep="224" class="feature" data-component="tools" data-subcomponent="javadoc(tool)" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/224" target="_blank" class="jep">JEP 224</a>: <span class="jep-name">HTML5 Javadoc</span>
    <div class="summary">Enhance the javadoc tool to generate HTML5 markup.</div>
    <div class="details"></div>
</div>

<div data-jep="268" class="feature" data-component="xml" data-subcomponent="jaxp" data-scope="SE" data-tags="xml">
    <a href="https://openjdk.java.net/jeps/268" target="_blank" class="jep">JEP 268</a>: <span class="jep-name">XML Catalogs</span>
    <div class="summary">Develop a standard XML Catalog API that supports the OASIS XML Catalogs standard, v1.1. The API will define catalog and catalog-resolver abstractions which can be used with the JAXP processors that accept resolvers.</div>
    <div class="details"></div>
</div>

<div data-jep="221" class="feature" data-component="tools" data-subcomponent="javadoc(tool)" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/221" target="_blank" class="jep">JEP 221</a>: <span class="jep-name">New Doclet API</span>
    <div class="summary">Provide a replacement for the Doclet API to leverage appropriate Java SE and JDK APIs, and update the standard doclet to use the new API.</div>
    <div class="details"></div>
</div>

<div data-jep="265" class="feature" data-component="client-libs" data-subcomponent="2d" data-scope="JDK" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/265" target="_blank" class="jep">JEP 265</a>: <span class="jep-name">Marlin Graphics Renderer</span>
    <div class="summary">Update Java 2D to use the Marlin Renderer as the default graphics rasterizer.</div>
    <div class="details"></div>
</div>

<div data-jep="222" class="feature" data-component="tools" data-subcomponent="jshell" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/222" target="_blank" class="jep">JEP 222</a>: <span class="jep-name">jshell: The Java Shell (Read-Eval-Print Loop)</span>
    <div class="summary">Provide an interactive tool to evaluate declarations, statements, and expressions of the Java programming language, together with an API so that other applications can leverage this functionality.</div>
    <div class="details"></div>
</div>

<div data-jep="266" class="feature" data-component="core-libs" data-subcomponent="java.util.concurrent" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/266" target="_blank" class="jep">JEP 266</a>: <span class="jep-name">More Concurrency Updates</span>
    <div class="summary">An interoperable publish-subscribe framework, enhancements to the CompletableFuture API, and various other improvements.</div>
    <div class="details"></div>
</div>

<div data-jep="229" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/229" target="_blank" class="jep">JEP 229</a>: <span class="jep-name">Create PKCS12 Keystores by Default</span>
    <div class="summary">Transition the default keystore type from JKS to PKCS12.</div>
    <div class="details"></div>
</div>

<div data-jep="197" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/197" target="_blank" class="jep">JEP 197</a>: <span class="jep-name">Segmented Code Cache</span>
    <div class="summary">Divide the code cache into distinct segments, each of which contains compiled code of a particular type, in order to improve performance and enable future extensions.</div>
    <div class="details"></div>
</div>

<div data-jep="274" class="feature" data-component="core-libs" data-subcomponent="java.lang.invoke" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/274" target="_blank" class="jep">JEP 274</a>: <span class="jep-name">Enhanced Method Handles</span>
    <div class="summary">Enhance the MethodHandle, MethodHandles, and MethodHandles.Lookup classes of the java.lang.invoke package to ease common use cases and enable better compiler optimizations by means of new MethodHandle combinators and lookup refinement.</div>
    <div class="details"></div>
</div>

<div data-jep="110" class="feature" data-component="core-libs" data-subcomponent="java.net" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/110" target="_blank" class="jep">JEP 110</a>: <span class="jep-name">HTTP/2 Client (Incubator)</span>
    <div class="summary">Define a new HTTP client API that implements HTTP/2 and WebSocket, and can replace the legacy HttpURLConnection API. The API will be delivered as an incubator module, as defined in JEP 11, with JDK 9. This implies:</div>
    <div class="details"></div>
</div>

<div data-jep="231" class="feature" data-component="tools" data-subcomponent="launcher" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/231" target="_blank" class="jep">JEP 231</a>: <span class="jep-name">Remove Launch-Time JRE Version Selection</span>
    <div class="summary">Remove the ability to request, at JRE launch time, a version of the JRE that is not the JRE being launched.</div>
    <div class="details"></div>
</div>

<div data-jep="275" class="feature" data-component="deploy" data-subcomponent="packager" data-scope="JDK" data-tags="deploy">
    <a href="https://openjdk.java.net/jeps/275" target="_blank" class="jep">JEP 275</a>: <span class="jep-name">Modular Java Application Packaging</span>
    <div class="summary">Integrate features from Project Jigsaw into the Java Packager, including module awareness and custom run-time creation.</div>
    <div class="details"></div>
</div>

<div data-jep="272" class="feature" data-component="client-libs" data-subcomponent="java.awt" data-scope="SE" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/272" target="_blank" class="jep">JEP 272</a>: <span class="jep-name">Platform-Specific Desktop Features</span>
    <div class="summary">Define a new public API to access platform-specific desktop features such as interacting with a task bar or dock, or listening for system or application events.</div>
    <div class="details"></div>
</div>

<div data-jep="273" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/273" target="_blank" class="jep">JEP 273</a>: <span class="jep-name">DRBG-Based SecureRandom Implementations</span>
    <div class="summary">Implement the three Deterministic Random Bit Generator (DRBG) mechanisms described in NIST 800-90Ar1.</div>
    <div class="details"></div>
</div>

<div data-jep="193" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/193" target="_blank" class="jep">JEP 193</a>: <span class="jep-name">Variable Handles</span>
    <div class="summary">Define a standard means to invoke the equivalents of various java.util.concurrent.atomic and sun.misc.Unsafe operations upon object fields and array elements, a standard set of fence operations for fine-grained control of memory ordering, and a standard reachability-fence operation to ensure that a referenced object remains strongly reachable.</div>
    <div class="details"></div>
</div>

<div data-jep="270" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/270" target="_blank" class="jep">JEP 270</a>: <span class="jep-name">Reserved Stack Areas for Critical Sections</span>
    <div class="summary">Reserve extra space on thread stacks for use by critical sections, so that they can complete even when stack overflows occur.</div>
    <div class="details"></div>
</div>

<div data-jep="271" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/271" target="_blank" class="jep">JEP 271</a>: <span class="jep-name">Unified GC Logging</span>
    <div class="summary">Reimplement GC logging using the unified JVM logging framework introduced in JEP 158.</div>
    <div class="details"></div>
</div>

<div data-jep="238" class="feature" data-component="tools" data-subcomponent="jar" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/238" target="_blank" class="jep">JEP 238</a>: <span class="jep-name">Multi-Release JAR Files</span>
    <div class="summary">Extend the JAR file format to allow multiple, Java-release-specific versions of class files to coexist in a single archive.</div>
    <div class="details"></div>
</div>

<div data-jep="236" class="feature" data-component="core-libs" data-subcomponent="jdk.nashorn" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/236" target="_blank" class="jep">JEP 236</a>: <span class="jep-name">Parser API for Nashorn</span>
    <div class="summary">Define a supported API for Nashorn's ECMAScript abstract syntax tree.</div>
    <div class="details"></div>
</div>

<div data-jep="237" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/237" target="_blank" class="jep">JEP 237</a>: <span class="jep-name">Linux/AArch64 Port</span>
    <div class="summary">Port JDK 9 to Linux/AArch64.</div>
    <div class="details"></div>
</div>

<div data-jep="278" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/278" target="_blank" class="jep">JEP 278</a>: <span class="jep-name">Additional Tests for Humongous Objects in G1</span>
    <div class="summary">Develop additional white-box tests for the Humongous Objects feature of the G1 Garbage Collector.</div>
    <div class="details"></div>
</div>

<div data-jep="158" class="feature" data-component="hotspot" data-subcomponent="svc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/158" target="_blank" class="jep">JEP 158</a>: <span class="jep-name">Unified JVM Logging</span>
    <div class="summary">Introduce a common logging system for all components of the JVM.</div>
    <div class="details"></div>
</div>

<div data-jep="235" class="feature" data-component="tools" data-subcomponent="javac" data-scope="Implementation" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/235" target="_blank" class="jep">JEP 235</a>: <span class="jep-name">Test Class-File Attributes Generated by javac</span>
    <div class="summary">Write tests to verify the correctness of class-file attributes generated by javac.</div>
    <div class="details"></div>
</div>

<div data-jep="279" class="feature" data-component="None" data-subcomponent="null" data-scope="Implementation" data-tags="None">
    <a href="https://openjdk.java.net/jeps/279" target="_blank" class="jep">JEP 279</a>: <span class="jep-name">Improve Test-Failure Troubleshooting</span>
    <div class="summary">Automatically collect diagnostic information which can be used for further troubleshooting in case of test failures and timeouts.</div>
    <div class="details"></div>
</div>

<div data-jep="199" class="feature" data-component="tools" data-subcomponent="javac" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/199" target="_blank" class="jep">JEP 199</a>: <span class="jep-name">Smart Java Compilation, Phase Two</span>
    <div class="summary">Improve the sjavac tool so that it can be used by default in the JDK build, and generalize it so that it can be used to build large projects other than the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="232" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="Implementation" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/232" target="_blank" class="jep">JEP 232</a>: <span class="jep-name">Improve Secure Application Performance</span>
    <div class="summary">Improve the performance of applications that are run with a security manager installed.</div>
    <div class="details"></div>
</div>

<div data-jep="276" class="feature" data-component="core-libs" data-subcomponent="java.lang.invoke" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/276" target="_blank" class="jep">JEP 276</a>: <span class="jep-name">Dynamic Linking of Language-Defined Object Models</span>
    <div class="summary">Provide a facility for linking high-level operations on objects such as "read a property", "write a property", "invoke a callable object", etc., expressed as names in INVOKEDYNAMIC call sites. Provide a default linker for the usual semantics of these operations on plain Java objects, as well as a facility for installing language-specific linkers.</div>
    <div class="details"></div>
</div>

<div data-jep="233" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/233" target="_blank" class="jep">JEP 233</a>: <span class="jep-name">Generate Run-Time Compiler Tests Automatically</span>
    <div class="summary">Develop a tool to test the run-time compilers by automatically generating test cases.</div>
    <div class="details"></div>
</div>

<div data-jep="277" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/277" target="_blank" class="jep">JEP 277</a>: <span class="jep-name">Enhanced Deprecation</span>
    <div class="summary">Revamp the @Deprecated annotation, and provide tools to strengthen the API life cycle.</div>
    <div class="details"></div>
</div>

<div data-jep="241" class="feature" data-component="core-svc" data-subcomponent="tools" data-scope="JDK" data-tags="core-svc">
    <a href="https://openjdk.java.net/jeps/241" target="_blank" class="jep">JEP 241</a>: <span class="jep-name">Remove the jhat Tool</span>
    <div class="summary">Remove the antiquated jhat tool.</div>
    <div class="details"></div>
</div>

<div data-jep="285" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/285" target="_blank" class="jep">JEP 285</a>: <span class="jep-name">Spin-Wait Hints</span>
    <div class="summary">Define an API to allow Java code to hint that a spin loop is being executed.</div>
    <div class="details"></div>
</div>

<div data-jep="165" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/165" target="_blank" class="jep">JEP 165</a>: <span class="jep-name">Compiler Control</span>
    <div class="summary">This JEP proposes an improved way to control the JVM compilers. It enables runtime manageable, method dependent compiler flags. (Immutable for the duration of a compilation.)</div>
    <div class="details"></div>
</div>

<div data-jep="283" class="feature" data-component="javafx" data-subcomponent="window-toolkit" data-scope="JDK" data-tags="javafx">
    <a href="https://openjdk.java.net/jeps/283" target="_blank" class="jep">JEP 283</a>: <span class="jep-name">Enable GTK 3 on Linux</span>
    <div class="summary">Enable Java graphical applications, whether based on JavaFX, Swing, or AWT, to use either GTK 2 or GTK 3 on Linux.</div>
    <div class="details"></div>
</div>

<div data-jep="240" class="feature" data-component="core-svc" data-subcomponent="tools" data-scope="JDK" data-tags="core-svc">
    <a href="https://openjdk.java.net/jeps/240" target="_blank" class="jep">JEP 240</a>: <span class="jep-name">Remove the JVM TI hprof Agent</span>
    <div class="summary">Remove the hprof agent from the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="284" class="feature" data-component="infrastructure" data-subcomponent="build" data-scope="Implementation" data-tags="infrastructure">
    <a href="https://openjdk.java.net/jeps/284" target="_blank" class="jep">JEP 284</a>: <span class="jep-name">New HotSpot Build System</span>
    <div class="summary">Rewrite the HotSpot build system using the build-infra framework.</div>
    <div class="details"></div>
</div>

<div data-jep="281" class="feature" data-component="hotspot" data-subcomponent="test" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/281" target="_blank" class="jep">JEP 281</a>: <span class="jep-name">HotSpot C++ Unit-Test Framework</span>
    <div class="summary">Enable and encourage the development of C++ unit tests for HotSpot.</div>
    <div class="details"></div>
</div>

<div data-jep="282" class="feature" data-component="tools" data-subcomponent="jlink" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/282" target="_blank" class="jep">JEP 282</a>: <span class="jep-name">jlink: The Java Linker</span>
    <div class="summary">Create a tool that can assemble and optimize a set of modules and their dependencies into a custom run-time image as defined in JEP 220.</div>
    <div class="details"></div>
</div>

<div data-jep="280" class="feature" data-component="tools" data-subcomponent="javac" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/280" target="_blank" class="jep">JEP 280</a>: <span class="jep-name">Indify String Concatenation</span>
    <div class="summary">Change the static String-concatenation bytecode sequence generated by javac to use invokedynamic calls to JDK library functions. This will enable future optimizations of String concatenation without requiring further changes to the bytecode emitted by javac.</div>
    <div class="details"></div>
</div>

<div data-jep="249" class="feature" data-component="security-libs" data-subcomponent="javax.net.ssl" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/249" target="_blank" class="jep">JEP 249</a>: <span class="jep-name">OCSP Stapling for TLS</span>
    <div class="summary">Implement OCSP stapling via the TLS Certificate Status Request extension (section 8 of RFC 6066) and the Multiple Certificate Status Request Extension (RFC 6961).</div>
    <div class="details"></div>
</div>

<div data-jep="247" class="feature" data-component="tools" data-subcomponent="javac" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/247" target="_blank" class="jep">JEP 247</a>: <span class="jep-name">Compile for Older Platform Versions</span>
    <div class="summary">Enhance javac so that it can compile Java programs to run on selected older versions of the platform.</div>
    <div class="details"></div>
</div>

<div data-jep="248" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/248" target="_blank" class="jep">JEP 248</a>: <span class="jep-name">Make G1 the Default Garbage Collector</span>
    <div class="summary">Make G1 the default garbage collector on 32- and 64-bit server configurations.</div>
    <div class="details"></div>
</div>

<div data-jep="201" class="feature" data-component="None" data-subcomponent="null" data-scope="Implementation" data-tags="None">
    <a href="https://openjdk.java.net/jeps/201" target="_blank" class="jep">JEP 201</a>: <span class="jep-name">Modular Source Code</span>
    <div class="summary">Reorganize the JDK source code into modules, enhance the build system to compile modules, and enforce module boundaries at build time.</div>
    <div class="details"></div>
</div>

<div data-jep="245" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/245" target="_blank" class="jep">JEP 245</a>: <span class="jep-name">Validate JVM Command-Line Flag Arguments</span>
    <div class="summary">Validate the arguments to all JVM command-line flags so as to avoid crashes, and ensure that appropriate error messages are displayed when they are invalid.</div>
    <div class="details"></div>
</div>

<div data-jep="289" class="feature" data-component="client-libs" data-subcomponent="null" data-scope="SE" data-tags="client-libs">
    <a href="https://openjdk.java.net/jeps/289" target="_blank" class="jep">JEP 289</a>: <span class="jep-name">Deprecate the Applet API</span>
    <div class="summary">Deprecate the Applet API, which is rapidly becoming irrelevant as web-browser vendors remove support for Java browser plug-ins. Guide developers to alternative technologies such as Java Web Start or installable applications.</div>
    <div class="details"></div>
</div>

<div data-jep="246" class="feature" data-component="security-libs" data-subcomponent="javax.crypto" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/246" target="_blank" class="jep">JEP 246</a>: <span class="jep-name">Leverage CPU Instructions for GHASH and RSA</span>
    <div class="summary">Improve the performance of GHASH and RSA cryptographic operations by leveraging recently-introduced SPARC and Intel x64 CPU instructions.</div>
    <div class="details"></div>
</div>

<div data-jep="243" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/243" target="_blank" class="jep">JEP 243</a>: <span class="jep-name">Java-Level JVM Compiler Interface</span>
    <div class="summary">Develop a Java based JVM compiler interface (JVMCI) enabling a compiler written in Java to be used by the JVM as a dynamic compiler.</div>
    <div class="details"></div>
</div>

<div data-jep="287" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="Implementation" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/287" target="_blank" class="jep">JEP 287</a>: <span class="jep-name">SHA-3 Hash Algorithms</span>
    <div class="summary">Implement the SHA-3 cryptographic hash functions (BYTE-only) specified in NIST FIPS 202.</div>
    <div class="details"></div>
</div>

<div data-jep="200" class="feature" data-component="None" data-subcomponent="null" data-scope="SE" data-tags="None">
    <a href="https://openjdk.java.net/jeps/200" target="_blank" class="jep">JEP 200</a>: <span class="jep-name">The Modular JDK</span>
    <div class="summary">Use the Java Platform Module System, specified by JSR 376 and implemented by JEP 261, to modularize the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="244" class="feature" data-component="security-libs" data-subcomponent="javax.net.ssl" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/244" target="_blank" class="jep">JEP 244</a>: <span class="jep-name">TLS Application-Layer Protocol Negotiation Extension</span>
    <div class="summary">Extend the javax.net.ssl package to support the TLS Application Layer Protocol Negotiation (ALPN) Extension, which provides the means to negotiate an application protocol for a TLS connection.</div>
    <div class="details"></div>
</div>

<div data-jep="288" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/288" target="_blank" class="jep">JEP 288</a>: <span class="jep-name">Disable SHA-1 Certificates</span>
    <div class="summary">Improve the security configuration of the JDK by providing a more flexible mechanism to disable X.509 certificate chains with SHA-1 based signatures.</div>
    <div class="details"></div>
</div>

</section>


# [JDK 10](https://openjdk.java.net/projects/jdk10/){:target="_blank"}

GA: 2018-03-20 <small class="timeago" datetime="2018-03-20"></small>

Features:

<section class="features">

<div data-jep="296" class="feature" data-component="infrastructure" data-subcomponent="build" data-scope="Implementation" data-tags="infrastructure">
    <a href="https://openjdk.java.net/jeps/296" target="_blank" class="jep">JEP 296</a>: <span class="jep-name">Consolidate the JDK Forest into a Single Repository</span>
    <div class="summary">Combine the numerous repositories of the JDK forest into a single repository in order to simplify and streamline development.</div>
    <div class="details"></div>
</div>

<div data-jep="286" class="feature" data-component="tools" data-subcomponent="null" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/286" target="_blank" class="jep">JEP 286</a>: <span class="jep-name">Local-Variable Type Inference</span>
    <div class="summary">Enhance the Java Language to extend type inference to declarations of local variables with initializers.</div>
    <div class="details"></div>
</div>

<div data-jep="319" class="feature" data-component="security-libs" data-subcomponent="java.security" data-scope="JDK" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/319" target="_blank" class="jep">JEP 319</a>: <span class="jep-name">Root Certificates</span>
    <div class="summary">Provide a default set of root Certification Authority (CA) certificates in the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="317" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/317" target="_blank" class="jep">JEP 317</a>: <span class="jep-name">Experimental Java-Based JIT Compiler</span>
    <div class="summary">Enable the Java-based JIT compiler, Graal, to be used as an experimental JIT compiler on the Linux/x64 platform.</div>
    <div class="details"></div>
</div>

<div data-jep="307" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/307" target="_blank" class="jep">JEP 307</a>: <span class="jep-name">Parallel Full GC for G1</span>
    <div class="summary">Improve G1 worst-case latencies by making the full GC parallel.</div>
    <div class="details"></div>
</div>

<div data-jep="304" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/304" target="_blank" class="jep">JEP 304</a>: <span class="jep-name">Garbage Collector Interface</span>
    <div class="summary">Improve the source code isolation of different garbage collectors by introducing a clean garbage collector (GC) interface.</div>
    <div class="details"></div>
</div>

<div data-jep="316" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/316" target="_blank" class="jep">JEP 316</a>: <span class="jep-name">Heap Allocation on Alternative Memory Devices</span>
    <div class="summary">Enable the HotSpot VM to allocate the Java object heap on an alternative memory device, such as an NV-DIMM, specified by the user.</div>
    <div class="details"></div>
</div>

<div data-jep="313" class="feature" data-component="tools" data-subcomponent="javah" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/313" target="_blank" class="jep">JEP 313</a>: <span class="jep-name">Remove the Native-Header Generation Tool (javah)</span>
    <div class="summary">Remove the javah tool from the JDK.</div>
    <div class="details"></div>
</div>

<div data-jep="314" class="feature" data-component="core-libs" data-subcomponent="java.util:i18n" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/314" target="_blank" class="jep">JEP 314</a>: <span class="jep-name">Additional Unicode Language-Tag Extensions</span>
    <div class="summary">Enhance java.util.Locale and related APIs to implement additional Unicode extensions of BCP 47 language tags.</div>
    <div class="details"></div>
</div>

<div data-jep="322" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/322" target="_blank" class="jep">JEP 322</a>: <span class="jep-name">Time-Based Release Versioning</span>
    <div class="summary">Revise the version-string scheme of the Java SE Platform and the JDK, and related versioning information, for present and future time-based release models.</div>
    <div class="details"></div>
</div>

<div data-jep="312" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/312" target="_blank" class="jep">JEP 312</a>: <span class="jep-name">Thread-Local Handshakes</span>
    <div class="summary">Introduce a way to execute a callback on threads without performing a global VM safepoint. Make it both possible and cheap to stop individual threads and not just all threads or none.</div>
    <div class="details"></div>
</div>

<div data-jep="310" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/310" target="_blank" class="jep">JEP 310</a>: <span class="jep-name">Application Class-Data Sharing</span>
    <div class="summary">To improve startup and footprint, extend the existing Class-Data Sharing ("CDS") feature to allow application classes to be placed in the shared archive.</div>
    <div class="details"></div>
</div>

</section>


# [JDK 11](https://openjdk.java.net/projects/jdk11/){:target="_blank"}

GA: 2018-09-25 <small class="timeago" datetime="2018-09-25"></small>

Features:

<section class="features">

<div data-jep="330" class="feature" data-component="tools" data-subcomponent="javac" data-scope="JDK" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/330" target="_blank" class="jep">JEP 330</a>: <span class="jep-name">Launch Single-File Source-Code Programs</span>
    <div class="summary">Enhance the java launcher to run a program supplied as a single file of Java source code, including usage from within a script by means of "shebang" files and related techniques.</div>
    <div class="details"></div>
</div>

<div data-jep="181" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="SE" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/181" target="_blank" class="jep">JEP 181</a>: <span class="jep-name">Nest-Based Access Control</span>
    <div class="summary">Introduce nests, an access-control context that aligns with the existing notion of nested types in the Java programming language. Nests allow classes that are logically part of the same code entity, but which are compiled to distinct class files, to access each other's private members without the need for compilers to insert accessibility-broadening bridge methods.</div>
    <div class="details"></div>
</div>

<div data-jep="315" class="feature" data-component="hotspot" data-subcomponent="compiler" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/315" target="_blank" class="jep">JEP 315</a>: <span class="jep-name">Improve Aarch64 Intrinsics</span>
    <div class="summary">Improve the existing string and array intrinsics, and implement new intrinsics for the java.lang.Math sin, cos and log functions, on AArch64 processors.</div>
    <div class="details"></div>
</div>

<div data-jep="327" class="feature" data-component="core-libs" data-subcomponent="java.lang" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/327" target="_blank" class="jep">JEP 327</a>: <span class="jep-name">Unicode 10</span>
    <div class="summary">Upgrade existing platform APIs to support version 10.0 of the Unicode Standard.</div>
    <div class="details"></div>
</div>

<div data-jep="324" class="feature" data-component="security-libs" data-subcomponent="javax.crypto" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/324" target="_blank" class="jep">JEP 324</a>: <span class="jep-name">Key Agreement with Curve25519 and Curve448</span>
    <div class="summary">Implement key agreement using Curve25519 and Curve448 as described in RFC 7748.</div>
    <div class="details"></div>
</div>

<div data-jep="335" class="feature" data-component="core-libs" data-subcomponent="jdk.nashorn" data-scope="JDK" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/335" target="_blank" class="jep">JEP 335</a>: <span class="jep-name">Deprecate the Nashorn JavaScript Engine</span>
    <div class="summary">Deprecate the Nashorn JavaScript script engine and APIs, and the jjs tool, with the intent to remove them in a future release.</div>
    <div class="details"></div>
</div>

<div data-jep="336" class="feature" data-component="tools" data-subcomponent="null" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/336" target="_blank" class="jep">JEP 336</a>: <span class="jep-name">Deprecate the Pack200 Tools and API</span>
    <div class="summary">Deprecate the pack200 and unpack200 tools, and the Pack200 API in java.util.jar.</div>
    <div class="details"></div>
</div>

<div data-jep="333" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/333" target="_blank" class="jep">JEP 333</a>: <span class="jep-name">ZGC: A Scalable Low-Latency Garbage Collector (Experimental)</span>
    <div class="summary">The Z Garbage Collector, also known as ZGC, is a scalable low-latency garbage collector.</div>
    <div class="details"></div>
</div>

<div data-jep="323" class="feature" data-component="tools" data-subcomponent="null" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/323" target="_blank" class="jep">JEP 323</a>: <span class="jep-name">Local-Variable Syntax for Lambda Parameters</span>
    <div class="summary">Allow var to be used when declaring the formal parameters of implicitly typed lambda expressions.</div>
    <div class="details"></div>
</div>

<div data-jep="320" class="feature" data-component="other-libs" data-subcomponent="null" data-scope="SE" data-tags="other-libs">
    <a href="https://openjdk.java.net/jeps/320" target="_blank" class="jep">JEP 320</a>: <span class="jep-name">Remove the Java EE and CORBA Modules</span>
    <div class="summary">Remove the Java EE and CORBA modules from the Java SE Platform and the JDK. These modules were deprecated in Java SE 9 with the declared intent to remove them in a future release.</div>
    <div class="details"></div>
</div>

<div data-jep="331" class="feature" data-component="hotspot" data-subcomponent="jvmti" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/331" target="_blank" class="jep">JEP 331</a>: <span class="jep-name">Low-Overhead Heap Profiling</span>
    <div class="summary">Provide a low-overhead way of sampling Java heap allocations, accessible via JVMTI.</div>
    <div class="details"></div>
</div>

<div data-jep="321" class="feature" data-component="core-libs" data-subcomponent="java.net" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/321" target="_blank" class="jep">JEP 321</a>: <span class="jep-name">HTTP Client (Standard)</span>
    <div class="summary">Standardize the incubated HTTP Client API introduced in JDK 9, via JEP 110, and updated in JDK 10.</div>
    <div class="details"></div>
</div>

<div data-jep="332" class="feature" data-component="security-libs" data-subcomponent="javax.net.ssl" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/332" target="_blank" class="jep">JEP 332</a>: <span class="jep-name">Transport Layer Security (TLS) 1.3</span>
    <div class="summary">Implement version 1.3 of the Transport Layer Security (TLS) Protocol RFC 8446.</div>
    <div class="details"></div>
</div>

<div data-jep="309" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="SE" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/309" target="_blank" class="jep">JEP 309</a>: <span class="jep-name">Dynamic Class-File Constants</span>
    <div class="summary">Extend the Java class-file format to support a new constant-pool form, CONSTANT_Dynamic. Loading a CONSTANT_Dynamic will delegate creation to a bootstrap method, just as linking an invokedynamic call site delegates linkage to a bootstrap method.</div>
    <div class="details"></div>
</div>

<div data-jep="328" class="feature" data-component="hotspot" data-subcomponent="jfr" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/328" target="_blank" class="jep">JEP 328</a>: <span class="jep-name">Flight Recorder</span>
    <div class="summary">Provide a low-overhead data collection framework for troubleshooting Java applications and the HotSpot JVM.</div>
    <div class="details"></div>
</div>

<div data-jep="318" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/318" target="_blank" class="jep">JEP 318</a>: <span class="jep-name">Epsilon: A No-Op Garbage Collector (Experimental)</span>
    <div class="summary">Develop a GC that handles memory allocation but does not implement any actual memory reclamation mechanism. Once the available Java heap is exhausted, the JVM will shut down.</div>
    <div class="details"></div>
</div>

<div data-jep="329" class="feature" data-component="security-libs" data-subcomponent="javax.crypto" data-scope="SE" data-tags="security-libs">
    <a href="https://openjdk.java.net/jeps/329" target="_blank" class="jep">JEP 329</a>: <span class="jep-name">ChaCha20 and Poly1305 Cryptographic Algorithms</span>
    <div class="summary">Implement the ChaCha20 and ChaCha20-Poly1305 ciphers as specified in RFC 7539. ChaCha20 is a relatively new stream cipher that can replace the older, insecure RC4 stream cipher.</div>
    <div class="details"></div>
</div>

</section>


# [JDK 12](https://openjdk.java.net/projects/jdk12/){:target="_blank"}

GA: 2019-03-19 <small class="timeago" datetime="2019-03-19"></small>

Features:

<section class="features">

<div data-jep="230" class="feature" data-component="performance" data-subcomponent="null" data-scope="JDK" data-tags="performance">
    <a href="https://openjdk.java.net/jeps/230" target="_blank" class="jep">JEP 230</a>: <span class="jep-name">Microbenchmark Suite</span>
    <div class="summary">Add a basic suite of microbenchmarks to the JDK source code, and make it easy for developers to run existing microbenchmarks and create new ones.</div>
    <div class="details"></div>
</div>

<div data-jep="340" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/340" target="_blank" class="jep">JEP 340</a>: <span class="jep-name">One AArch64 Port, Not Two</span>
    <div class="summary">Remove all of the sources related to the arm64 port while retaining the 32-bit ARM port and the 64-bit aarch64 port.</div>
    <div class="details"></div>
</div>

<div data-jep="341" class="feature" data-component="hotspot" data-subcomponent="runtime" data-scope="JDK" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/341" target="_blank" class="jep">JEP 341</a>: <span class="jep-name">Default CDS Archives</span>
    <div class="summary">Enhance the JDK build process to generate a class data-sharing (CDS) archive, using the default class list, on 64-bit platforms.</div>
    <div class="details"></div>
</div>

<div data-jep="326" class="feature" data-component="tools" data-subcomponent="null" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/326" target="_blank" class="jep">JEP 326</a>: <span class="jep-name">Raw String Literals (Preview)</span>
    <div class="summary">Add raw string literals to the Java programming language. A raw string literal can span multiple lines of source code and does not interpret escape sequences, such as \n, or Unicode escapes, of the form \uXXXX. This will be a preview language feature.</div>
    <div class="details"></div>
</div>

<div data-jep="346" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/346" target="_blank" class="jep">JEP 346</a>: <span class="jep-name">Promptly Return Unused Committed Memory from G1</span>
    <div class="summary">Enhance the G1 garbage collector to automatically return Java heap memory to the operating system when idle.</div>
    <div class="details"></div>
</div>

<div data-jep="325" class="feature" data-component="tools" data-subcomponent="null" data-scope="SE" data-tags="tools">
    <a href="https://openjdk.java.net/jeps/325" target="_blank" class="jep">JEP 325</a>: <span class="jep-name">Switch Expressions (Preview)</span>
    <div class="summary">Extend the switch statement so that it can be used as either a statement or an expression, and that both forms can use either a "traditional" or "simplified" scoping and control flow behavior. These changes will simplify everyday coding, and also prepare the way for the use of pattern matching (JEP 305) in switch. This will be a preview language feature.</div>
    <div class="details"></div>
</div>

<div data-jep="344" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/344" target="_blank" class="jep">JEP 344</a>: <span class="jep-name">Abortable Mixed Collections for G1</span>
    <div class="summary">Make G1 mixed collections abortable if they might exceed the pause target.</div>
    <div class="details"></div>
</div>

<div data-jep="334" class="feature" data-component="core-libs" data-subcomponent="java.lang.invoke" data-scope="SE" data-tags="core-libs">
    <a href="https://openjdk.java.net/jeps/334" target="_blank" class="jep">JEP 334</a>: <span class="jep-name">JVM Constants API</span>
    <div class="summary">Introduce an API to model nominal descriptions of key class-file and run-time artifacts, in particular constants that are loadable from the constant pool.</div>
    <div class="details"></div>
</div>

<div data-jep="189" class="feature" data-component="hotspot" data-subcomponent="gc" data-scope="Implementation" data-tags="hotspot">
    <a href="https://openjdk.java.net/jeps/189" target="_blank" class="jep">JEP 189</a>: <span class="jep-name">Shenandoah: A Low-Pause-Time Garbage Collector (Experimental)</span>
    <div class="summary">Add a new garbage collection (GC) algorithm named Shenandoah which reduces GC pause times by doing evacuation work concurrently with the running Java threads. Pause times with Shenandoah are independent of heap size, meaning you will have the same consistent pause times whether your heap is 200 MB or 200 GB.</div>
    <div class="details"></div>
</div>

</section>

<script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>

