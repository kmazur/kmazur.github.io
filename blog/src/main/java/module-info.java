module pl.kmazur.blog {
    requires java.net.http;
    requires org.jsoup;
    requires com.fasterxml.jackson.databind;
    requires com.fasterxml.jackson.core;

    opens pl.kmazur.blog.jdk;
}
