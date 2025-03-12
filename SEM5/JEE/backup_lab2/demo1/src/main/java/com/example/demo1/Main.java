package com.example.demo1;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        EntityManagerFactory emf = Persistence.createEntityManagerFactory("default");
        EntityManager em = emf.createEntityManager();

        Scanner scanner = new Scanner(System.in);

        System.out.println("Welcome to the Card Creator!");

        closeDatabase:
        while (true) {
            System.out.println("Choose an option:");
            System.out.println("1. Show existing cards");
            System.out.println("2. Create a new card");
            System.out.println("3. Modify existing card");
            System.out.println("4. Delete existing card");
            System.out.println("5. Exit");

            int option = scanner.nextInt();

            switch(option) {
                case 1:
                    showCards(em);
                    break;
                case 2:
                    createCard(em, option);
                    break;
                case 3:
                    modifyCard(em, option);
                    break;
                case 4:
                    deleteCard(em, option);
                    break;
                case 5:
                    System.out.println("Done.");
                    break closeDatabase;
                default:
                    System.out.println("Invalid option.");
            }
        }

        em.close();
        emf.close();
        scanner.close();
    }

    private static void showCards(EntityManager em) {
        em.createQuery("SELECT c FROM Card c", Card.class)
                .getResultList()
                .forEach(System.out::println);
    }

    private static void createCard(EntityManager em, int option) {

        Scanner scanner = new Scanner(System.in);

        try {
            System.out.print("Enter card type: ");
            String type = scanner.nextLine();

            System.out.print("Enter card cost: ");
            int cost = scanner.nextInt();

            Card newCard = new Card();
            newCard.setType(type);
            newCard.setCost(cost);

            em.getTransaction().begin();
            em.persist(newCard);
            em.getTransaction().commit();

            System.out.println("New Card created: " + newCard);

        } catch (Exception e) {
            System.err.println("An error occurred: " + e.getMessage());
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
        }
    }

    private static void modifyCard(EntityManager em, int option) {

        Scanner scanner = new Scanner(System.in);

        try {
            System.out.println("Enter the ID of the card you want to modify: ");
            Long id = scanner.nextLong();
            scanner.nextLine();
            Card card = em.find(Card.class, id);

            if (card == null) {
                System.out.println("Card not found.");
                return;
            }

            System.out.println("Enter column to modify: ");
            String column = scanner.nextLine();
            System.out.println("Enter new value: ");
            String value = scanner.nextLine();

            em.getTransaction().begin();
            switch (column) {
                case "type":
                    card.setType(value);
                    break;
                case "cost":
                    card.setCost(Integer.parseInt(value));
                    break;
                default:
                    System.out.println("Invalid column.");
                    break;
            }

            em.merge(card);
            em.getTransaction().commit();

        } catch (Exception e) {
            System.err.println("An error occurred: " + e.getMessage());
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
        }
    }

    private static void deleteCard(EntityManager em, int option) {

        Scanner scanner = new Scanner(System.in);

        try {
            System.out.println("Enter the ID of the card you want to modify: ");
            Long id = scanner.nextLong();
            scanner.nextLine();
            Card card = em.find(Card.class, id);

            if (card == null) {
                System.out.println("Card not found.");
                return;
            }

            em.getTransaction().begin();
            em.remove(card);
            em.getTransaction().commit();

        } catch (Exception e) {
            System.err.println("An error occurred: " + e.getMessage());
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
        }
    }
}
