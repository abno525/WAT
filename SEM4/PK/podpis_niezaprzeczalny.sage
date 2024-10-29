# Arkadiusz Ostrzyżek
# WCY22KY2S1 83744
# Algorytm generacji podpisu

# Wejście:
# G - ciało w którym operujemy
# m - wiadomość do podpisania
# private_key - klucz prywatny

# Wyjście:
# z - podpis 

def krok0(G, m, private_key):
    z = G(m^private_key)
    return z



# Protokół weryfikacji podpisu
# krok 1
# użytkownik B wybiera dwie liczby losowe a i b, 
# obie mniejsze niż p i przesyła do użytkownika A 
# wynik obliczeń c = m^a*g^b (mod p)

# Wejście:
# G - ciało w którym operujemy

# Wyjście:
# c - wynik obliczeń

def krok1(G, m):
    g = G.primitive_element()
    a = Integer(G.random_element())
    b = Integer(G.random_element())
    c = G(m^(a)*g^(b))
    return c, b, a

# krok 2
# użytkownik A wybiera liczbę losową q mniejszą od p, 
# oblicza i przesyła do użytkownika
# B wyniki działań:
# s1 = c g^q (mod p)
# s2 = (c g^q)^x (mod p)



# Wejście:
# G - ciało w którym operujemy
# c - wynik obliczeń z kroku 1
# private_key - klucz prywatny

# Wyjście
# s1, s2 - wyniki działań

def krok2(G, c, private_key):
    g = G.primitive_element()
    q = Integer(G.random_element())
    s1 = G(c*g^q)
    s2 = G((c*g^q)^private_key)
    return s1, s2, q



# krok 3
# użytkownik B przesyła do A wartości a i b,
# tak więc użytkownik A może potwierdzić,
# że użytkownik B nie oszukiwał w kroku 1

# Wejście:
# G - ciało w którym operujemy
# a, b - liczby losowe z kroku 1
# c - wynik obliczeń z kroku 1

# Wyjście
# boolean - stwierdzenie, czy strona B oszukała

def krok3(G, a, b, c):
    g = G.primitive_element()
    return True if c == G((m^a)*(g^b)) else False



# krok 4
#  użytkownik A przesyła do B wartość q, 
# więc użytkownik B może użyć z (z = mx (mod p))
# i obliczyć samodzielnie s1 i s2:

def krok4(G, a, b, c, q, z, public_key, s1, s2):
    g = G.primitive_element()
    if s1 != G(c*(g^q)):
        return False
    
    if s2 != G((public_key^(b+q))*(z^a)):
        return False
    
    return True



# przykład użycia

b= 20
p = random_prime(2^(b), lbound=2^(b-1))
print("b.nbits:")
print(p.nbits())
G=GF(p)    
g = G.primitive_element()
m = Integer(G.random_element())
    
while True:
    private_key = G.random_element()
    if (G(private_key).gcd(G(p-1)) == 1):
        break

public_key = g^private_key

print()
print(G)
print("\nPrivate Key:")
print(private_key)

print("\nPublic Key:")
print(public_key)

print("\nMessage:")
print(m)

z = krok0(G, m, private_key)
print("\nz:")
print(z)

c, b, a = krok1(G, m)
print("\nc:")
print(c)

s1, s2, q = krok2(G, c, private_key)
print("\ns1:")
print(s1)
print("\ns2:")
print(s2)

if (krok3(G, a, b, c) == False):
    raise Exception("Użytkownik B oszukał!")
    
if (krok4(G, a, b, c, q, z, public_key, s1, s2) == False):
    raise Exception("nUżytkownik A oszukał!")

print("Użytkownik A poprawnie podpisał tekst")