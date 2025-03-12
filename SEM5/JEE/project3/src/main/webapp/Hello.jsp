<%@ page import="jakarta.servlet.http.Cookie" %>
<%
    Cookie[] cookies = request.getCookies();
    String userName = null;
    if (cookies != null) {
        for (Cookie cookie : cookies) {
            if ("userName".equals(cookie.getName())) {
                userName = cookie.getValue();
                break;
            }
        }
    }
    if (userName != null) {
%>
    <h1>Hello, <%= userName %>, you've been redirected successfully!</h1>
<%
    } else {
        response.sendRedirect("index.html");
    }
%>