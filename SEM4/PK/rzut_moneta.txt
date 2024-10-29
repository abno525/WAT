# Arkadiusz Ostrzyżek
# WCY22KY2S1 83744

def primitive_elements(p):
    F = FiniteField(p)  # Replace p with the prime
    order = F.cardinality()
    primitive_elements = [a for a in F if a != 0 and a.multiplicative_order() == order - 1]
    return primitive_elements

# parametry wejściowe dla protokołu
b = 10

# krok 1
# użytkownicy A i B wspólnie wybierają liczbę pierwszą p w taki sposób, że jest znany
# rozkład liczby p − 1 na czynniki

# wejscie:
# b - wielkość liczby pierwszej w bitach
# wyjscie:
# p - ustalona liczba pierwsza

def krok1(b):
    return random_prime(2^(b-1), 2^(b))

# krok 2
# użytkownik B wybiera dwa elementy pierwotne h i t z GF(p), przesyła je użytkownikowi A

# wejście: 
# p - ustalona liczba pierwsza
# wyjście:
# h, t - dwa elementy pierwotne

def krok2(p):
    primlist = primitive_elements(p)
    h = primlist[randrange(0, len(primlist))]
    t = primlist[randrange(0, len(primlist))]
    while (h == t):
        t = primlist[randrange(0, len(primlist))]
    return h, t

# krok 3
# użytkownik A wybiera losową liczbę całkowitą x względnie pierwszą z p−1, oblicza jedną 
# z dwóch wartości:
# y = h^x (mod p) albo y = t^x (mod p)

# wejście:
# p - ustalona liczba pierwsza
# h, t - dwa elementy pierwotne
# wyjście:
# l - sposób wylosowany
# y - wynik obliczeń
# x - liczba losowa

def krok3(p, h, t):
    
    x = randrange(1,p)
    while gcd(x, p-1) != 1:
        x = randrange(1,p)
        
    if (randrange(0,2)):
        return 1, Integer(h^x % p), x
    else: 
        return 0, Integer(t^x % p), x     

# krok 4
# użytkownik B odgaduje, czy y jest funkcją h albo t, i przesyła swoje przypuszczenie
# użytkownikowi A

# wejście:
# brak (normalnie user input)
# wyjście:
# opt - decyzja urzytkownika

def krok4():
    return randrange(0,2)

# krok 5
# użytkownik B odgaduje, czy y jest funkcją h albo t, i przesyła swoje przypuszczenie
# użytkownikowi A

# wejście:
# opt - decyzja urzytkownika
# l - sposób wylosowany
# wyjście: 
# tf - orzeł albo reszka

def krok5(opt, l):
    if (opt == l):
        return True
    return False

# użytkownik A przesyła x do użytkownika B, aby ten mógł samodzielnie określić wynik
# rzutu.

# wejście:
# opt - decyzja urzytkownika
# h, t - dwa elementy pierwotne
# x - liczba losowa
# y - wynik obliczeń
# l - sposób wylosowany

# wyjście:
# wynik sprawdzenia

def krok6(opt, h, t, x, y):
    if (opt):
        if (y == h^x % p):
            return True
    else:
        if (y == t^x % p):
            return True
    return False

# Przykład użycia

p = krok1(b)
print(p)

h, t = krok2(p)
print(h, t)

l, y, x = krok3(p, h, t)
print(l, y, x)

opt = krok4()
print(opt)

tf = krok5(opt, l)
print(tf)

print(krok6(opt, h, t, x, y))




