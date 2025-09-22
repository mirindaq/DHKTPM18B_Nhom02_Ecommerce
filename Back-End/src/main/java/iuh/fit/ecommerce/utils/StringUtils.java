package iuh.fit.ecommerce.utils;

public class StringUtils {
    public static String normalizeString(String text){
        text = org.apache.commons.lang3.StringUtils.stripAccents(text);
        text = text.toLowerCase();
        text = text.replaceAll("[^a-z0-9\\s]", "");
        text = text.replaceAll("\\s+", "-");
        return text;
    }
}
