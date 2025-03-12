
package com.mycompany.project1;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.LocalTime;

@WebServlet("/HelloServlet")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("timeCookie".equals(cookie.getName())) {
                    
                    response.setContentType("text/html");
                    response.getWriter().println("<h1>Remaining cookie time is: " + (30 + Duration.between( LocalTime.now(), LocalTime.parse(cookie.getValue())).toSeconds() ) + "</h1>");
                    
                    break;
                }
            }
        } else {
            response.setContentType("text/html");
            response.getWriter().println("<h1>No cookie set!</h1>");
        }
    }
}