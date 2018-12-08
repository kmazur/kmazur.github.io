package pl.kmazur.blog.html;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class HtmlUtils {

    private static final DateTimeFormatter ISSUE_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private HtmlUtils() {
        throw new AssertionError("Prevent instantiability");
    }

    public static LocalDateTime parseDateTime(String dateText) {
        if (dateText == null || dateText.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(dateText, ISSUE_DATE_FORMATTER);
    }

    public static Integer parseInteger(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
