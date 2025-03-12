package com.example.demo1;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "NameSetter", value = "/test")
public class Test {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        PrintWriter out = response.getWriter();
        out.println("<form method='post' action='/demo1-1.0-SNAPSHOT/naming-servlet'>");
        out.println("<label for='username'>Imie:</label>");
        out.println("<input type='text' id='username' name='username'><br>");
        out.println("<button type='submit' name='action' value='changeName'>Zmien</button>");
        out.println("</form>");

    }
}
