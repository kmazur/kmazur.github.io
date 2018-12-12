package pl.kmazur.blog.jdk;

import pl.kmazur.blog.html.HtmlPage;
import pl.kmazur.blog.html.HtmlUtils;
import pl.kmazur.blog.html.JepPage;
import pl.kmazur.blog.html.JiraPage;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinTask;

import static java.util.stream.Collectors.toList;

public class JdkCrawler {

    private static final int PARALLELISM = 30;

    public List<JepData> getJepDataList(List<String> jdkFeatureUrls) {
        ForkJoinPool pool = new ForkJoinPool(PARALLELISM);
        try {
            return jdkFeatureUrls.parallelStream()
                    .map(featuresUrl -> pool.submit(() -> getJepData(featuresUrl)))
                    .map(ForkJoinTask::join)
                    .flatMap(Collection::stream)
                    .collect(toList());
        } finally {
            pool.shutdownNow();
        }
    }

    private List<JepData> getJepData(String featuresUrl) {
        HtmlPage doc = new HtmlPage(featuresUrl);
        Set<String> jeps = getJepUrls(doc);
        return jeps.parallelStream()
                .map(this::parseJepData)
                .collect(toList());
    }

    private JepData parseJepData(String jepUrl) {
        JepPage jepPage = new JepPage(jepUrl);

        JepData data = new JepData();
        data.setTitle(jepPage.getTitle());
        data.setSummary(jepPage.getSummary());
        data.setIssueUrl(jepPage.getIssueUrl());

        JiraPage jiraPage = jepPage.getJiraPage();

        Map<String, String> detailsMap = jiraPage.getIssueDetails();
        data.setComponent(detailsMap.get("Component/s:"));
        data.setSubcomponent(detailsMap.get("Subcomponent:"));
        data.setScope(detailsMap.get("Scope:"));
        data.setEffort(detailsMap.get("Effort:"));
        data.setDuration(detailsMap.get("Duration:"));
        data.setNumber(HtmlUtils.parseInteger(detailsMap.get("JEP Number:")));
        data.setDuration(detailsMap.get("Duration:"));
        data.setAsignee(detailsMap.get("Assignee:"));
        data.setReporter(detailsMap.get("Reporter:"));
        data.setOwner(detailsMap.get("Owner:"));
        data.setCreated(HtmlUtils.parseDateTime(detailsMap.get("Created:")));
        data.setResolved(HtmlUtils.parseDateTime(detailsMap.get("Resolved:")));
        data.setRelease(detailsMap.get("Fix Version/s:"));

        return data;
    }

    private Set<String> getJepUrls(HtmlPage page) {
        //language=RegExp
        return page.getUrls(`//openjdk\.java\.net/jeps/\d+`);
    }

}
