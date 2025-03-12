package com.mycompany.project1;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import java.time.LocalTime;

@WebServlet("/RedirectServlet")
public class RedirectServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

            Cookie timeCookie = new Cookie("timeCookie", LocalTime.now().toString());
            timeCookie.setMaxAge(30);
            response.addCookie(timeCookie);
            
            response.setContentType("text/html");
            response.getWriter().println("<h1>Cookie set with time: " +  LocalTime.now().toString() + "</h1>");

    }
}