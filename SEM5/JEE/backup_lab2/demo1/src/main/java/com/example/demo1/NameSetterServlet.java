package com.example.demo1;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.*;

@WebServlet(name = "NameSetter", value = "/naming-servlet")
public class NameSetterServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");

        // Check if the user has a "userId" cookie
        Cookie[] cookies = request.getCookies();
        boolean userIdFound = false;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("userId".equals(cookie.getName())) {
                    userIdFound = true;
                    break;
                }
            }
        }

        if (userIdFound) {
            // Redirect to another servlet if the userId cookie exists
            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");
        } else {
            // Show the form if the userId cookie doesn't exist
            PrintWriter out = response.getWriter();
            out.println("<form method='post' action='/demo1-1.0-SNAPSHOT/naming-servlet'>");
            out.println("<label for='username'>Imie:</label>");
            out.println("<input type='text' id='username' name='username'><br>");
            out.println("<button type='submit' name='action' value='changeName'>Zmien</button>");
            out.println("</form>");
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String action = request.getParameter("action");

        EntityManagerFactory emf = Persistence.createEntityManagerFactory("default");
        EntityManager em = emf.createEntityManager();

        if ("changeName".equals(action)) {
            String username = request.getParameter("username");

            // Always set a new cookie
            Cookie userCookie = new Cookie("userId", username);
            userCookie.setMaxAge(24 * 60 * 60); // 1 day expiration
            response.addCookie(userCookie);

            // Redirect to hello-servlet
            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");
        } else {
            // Default redirect if no action
            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");
        }
    }

}
