package pl.kmazur.blog.html;

import java.util.HashMap;
import java.util.Map;

public class JiraPage {

    private final HtmlPage page;

    public JiraPage(String url) {
        this.page = new HtmlPage(url);
    }

    public Map<String, String> getIssueDetails() {
        var result = new HashMap<String, String>();
        result.putAll(page.getKeyValueMap("#details-module", "li.item > div.wrap"));
        result.putAll(page.getKeyValueMap("#peoplemodule", "li > dl"));
        result.putAll(page.getKeyValueMap("#datesmodule", "li > dl"));
        return result;
    }
}
