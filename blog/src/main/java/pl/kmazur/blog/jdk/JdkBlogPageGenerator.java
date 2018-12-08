package pl.kmazur.blog.jdk;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.groupingBy;

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

    public static void main(String[] args) {
        var crawler      = new JdkCrawler();
        var jepDataList  = crawler.getJepDataList(JDK_FEATURE_URLS);
        var jepByVersion = jepDataList.stream().collect(groupingBy(JepData::getRelease));

        jepByVersion.keySet().stream()
                .sorted(Comparator.comparing(Integer::valueOf))
                .forEach(version -> printJdk(jepByVersion, version));
    }

    private static void printJdk(Map<String, List<JepData>> jepByVersion, String version) {
        List<JepData> jeps = jepByVersion.get(version);
        System.out.printf("# [JDK %s](https://openjdk.java.net/projects/jdk%s/){:target=\"_blank\"}%n%n", version, version);
        System.out.printf("GA: %s <small class=\"timeago\" datetime=\"%s\"></small>%n%n", GA_MAP.get(version), GA_MAP.get(version));
        System.out.printf("Features:%n%n");
        System.out.printf("<section class=\"features\">%n%n");
        jeps.forEach(JdkBlogPageGenerator::printJep);
        System.out.printf("</section>%n%n");
        System.out.println();
    }

    private static void printJep(JepData jep) {
        System.out.printf(
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
