package pl.kmazur.blog.jdk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

import static java.nio.file.StandardOpenOption.CREATE;
import static java.nio.file.StandardOpenOption.TRUNCATE_EXISTING;
import static java.util.stream.Collectors.groupingBy;

public class JdkBlogPageGenerator {

    private static final List<String> JDK_FEATURE_URLS = Arrays.asList(
            "https://openjdk.java.net/projects/jdk8/features",
            "https://openjdk.java.net/projects/jdk9/",
            "https://openjdk.java.net/projects/jdk/10/",
            "https://openjdk.java.net/projects/jdk/11/",
            "https://openjdk.java.net/projects/jdk/12/"
    );

    private static final Path OUTPUT_PATH = Path.of("..", "..", "experiments", "web", "jdk", "data", "jdk-data.json");

    public static void main(String[] args) throws IOException {
        var crawler = new JdkCrawler();
        var jepDataList = crawler.getJepDataList(JDK_FEATURE_URLS);
        var jepByVersion = jepDataList.stream().collect(groupingBy(JepData::getRelease));

        ObjectMapper mapper = new ObjectMapper()
                .findAndRegisterModules()
                .enable(SerializationFeature.INDENT_OUTPUT);

        Files.createDirectories(OUTPUT_PATH.getParent());
        Files.writeString(OUTPUT_PATH, mapper.writeValueAsString(jepByVersion), CREATE, TRUNCATE_EXISTING);
    }
}
