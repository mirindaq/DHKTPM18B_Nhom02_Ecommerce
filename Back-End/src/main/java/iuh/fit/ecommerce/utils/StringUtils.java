package iuh.fit.ecommerce.utils;

public class StringUtils {
    public static String normalizeString(String text){
        if (text == null) return "";
        text = org.apache.commons.lang3.StringUtils.stripAccents(text).toLowerCase().trim();
        text = text.replaceAll("[^a-z0-9\\s]", "");
        text = text.replaceAll("\\s+", "-");
        text = text.replaceAll("^-+|-+$", "");
        return text;
    }
}
