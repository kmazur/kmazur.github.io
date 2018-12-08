package pl.kmazur.blog.html;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.Map;
import java.util.Set;

import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;

public class HtmlPage {

    private static final int REQUEST_TIMEOUT = 60_000;

    private final Document doc;

    public HtmlPage(String url) {
        this.doc = getDocument(requireNonNull(url, "url cannot be null"));
    }

    public Set<String> getUrls(String pattern) {
        return getUrls(new Elements(doc), pattern);
    }

    public Set<String> getUrls(String rootElemSelector, String pattern) {
        Elements select = doc.select(rootElemSelector);
        return getUrls(select, pattern);
    }

    private Set<String> getUrls(Elements select, String pattern) {
        return select
                .select("a[href]").stream()
                .map(a -> a.attr("href"))
                .filter(href -> href.matches(pattern))
                .map(href -> href.startsWith("https:") ? href : "https:" + href)
                .collect(toSet());
    }

    public Map<String, String> getKeyValueMap(String rootElementSelector, String elementSelector) {
        Elements rootElem = doc.select(rootElementSelector);
        Elements elements = rootElem.select(elementSelector);
        return elements.stream()
                .filter(elems -> elems.children().size() == 2)
                .collect(toMap(
                        elems -> elems.child(0).text().trim(),
                        elems -> elems.child(1).text().trim(),
                        (v1, v2) -> v1 + ";" + v2
                ));
    }

    private Document getDocument(String url) {
        try {
            return Jsoup.parse(new URL(url), REQUEST_TIMEOUT);
        } catch (IOException e) {
            throw new UncheckedIOException("Error for: " + url, e);
        }
    }

    public String location() {
        return doc.location();
    }

    public Document getDocument() {
        return doc;
    }
}
