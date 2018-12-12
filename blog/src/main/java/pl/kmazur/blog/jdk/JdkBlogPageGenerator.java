package pl.kmazur.blog.jdk;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.nio.file.StandardOpenOption.TRUNCATE_EXISTING;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.joining;

public class JdkBlogPageGenerator {

    private static final Map<String, String> GA_MAP = Map.of(
            "7", "2011-07-28",
            "8", "2014-03-18",
            "9", "2017-09-21",
            "10", "2018-03-20",
            "11", "2018-09-25",
            "12", "2019-03-19"
    );

    private static final List<String> JDK_FEATURE_URLS = Arrays.asList(
            "https://openjdk.java.net/projects/jdk8/features",
            "https://openjdk.java.net/projects/jdk9/",
            "https://openjdk.java.net/projects/jdk/10/",
            "https://openjdk.java.net/projects/jdk/11/",
            "https://openjdk.java.net/projects/jdk/12/"
    );

    private static final String DRAFTS_PATH = "_drafts";

    public static void main(String[] args) throws IOException {
        var crawler = new JdkCrawler();
        var jepDataList = crawler.getJepDataList(JDK_FEATURE_URLS);
        var jepByVersion = jepDataList.stream().collect(groupingBy(JepData::getRelease));

        String data = jepByVersion.keySet().stream()
                .sorted(Comparator.comparing(Integer::valueOf))
                .map(version -> getJdkSection(jepByVersion, version))
                .collect(joining());

        String header = getArticleHeader();
        String placeholder = getFilterPlaceholder();

        String fileName = "jdk9-through-12.markdown";
        String content = header + placeholder + data;

        Files.write(Paths.get(DRAFTS_PATH + "/" + fileName), content.getBytes(UTF_8), TRUNCATE_EXISTING);
    }

    private static String getFilterPlaceholder() {
        return "<div class=\"btn-group\" id=\"filter\">\n" +
                "</div>\n";
    }

    private static String getArticleHeader() {
        return `
                ---
                layout: post
                author: kmazur
                toc: false
                title: From jdk8 to jdk12
                cssId: jdk
                tags: java jdk jdk8 jdk9 jdk10 jdk11 jdk12
                jsarr:
                  - moment.min.js
                  - https://unpkg.com/react@16/umd/react.production.min.js
                  - https://unpkg.com/react-dom@16/umd/react-dom.production.min.js
                  - https://cdnjs.cloudflare.com/ajax/libs/reactstrap/6.5.0/reactstrap.full.js
                  - https://code.jquery.com/jquery-3.3.1.slim.min.js
                  - https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js
                  - jdk9-12.js
                ---
                `.align();
    }

    private static String getJdkSection(Map<String, List<JepData>> jepByVersion, String version) {
        List<JepData> jeps = jepByVersion.get(version);
        StringBuilder builder = new StringBuilder();
        builder.append(String.format(`# [JDK %s](https://openjdk.java.net/projects/jdk%s/){:target="_blank"}%n%n`, version, version));
        builder.append(String.format(`GA: %s <small class="timeago" datetime="%s"></small>%n%n`, GA_MAP.get(version), GA_MAP.get(version)));
        builder.append(String.format(`Features:%n%n`));
        builder.append(String.format(`<section class="features">%n%n`));
        jeps.forEach(jep -> builder.append(getJepSection(jep)));
        builder.append(String.format("</section>%n%n"));
        return builder.toString();
    }

    private static String getJepSection(JepData jep) {
        return String.format(
                "<div data-jep=\"%s\" class=\"feature\" data-component=\"%s\" data-subcomponent=\"%s\" data-scope=\"%s\" data-tags=\"%s\">%n" +
                        "    <a href=\"https://openjdk.java.net/jeps/%s\" target=\"_blank\" class=\"jep\">JEP %s</a>: <span class=\"jep-name\">%s</span>%n" +
                        "    <div class=\"summary\">%s</div>%n" +
                        "    <div class=\"details\"></div>%n" +
                        "</div>%n%n",
                jep.getNumber(),
                jep.getComponent(),
                jep.getSubcomponent(),
                jep.getScope(),
                jep.getComponent(),
                jep.getNumber(),
                jep.getNumber(),
                jep.getTitle(),
                jep.getSummary()
        );
    }
}
