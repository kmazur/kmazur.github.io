package pl.kmazur.blog.html;

import org.jsoup.select.Elements;

public class JepPage {

    private static final String EMPTY_STRING = "";

    private final HtmlPage page;

    public JepPage(String url) {
        this.page = new HtmlPage(url);
    }

    public String getIssueUrl() {
        var info = page.getKeyValueMap("#main table.head", "tr");
        var id   = info.get("Issue");
        if (id == null) {
            throw new IllegalStateException("No issue url in jep page: " + page.location());
        }
        return "https://bugs.openjdk.java.net/browse/JDK-" + id;
    }

    public String getSummary() {
        Elements elements = page.getDocument().select("#Summary + p");
        if (elements.isEmpty()) {
            return EMPTY_STRING;
        }
        return elements.get(0).text().trim();
    }

    public JiraPage getJiraPage() {
        return new JiraPage(getIssueUrl());
    }

    public String getTitle() {
        return page.getDocument().title().substring("JEP 102:".length()).trim();
    }
}
