
# Protokół ślepych podpisów cyfrowych bazujących na RSA
# Arkadiusz Ostrzyżek
# WCY22KY2S1 83477




# wejście:
# b - ilość bitów
# wyjście:
# n - moduł
# e - klucz publiczny
# d - klucz prywatny
def generator_rsa(b):
    
    p = random_prime(2^(b // 2), false, 2^((b // 2) -1))
    q = random_prime(2^(b // 2), false, 2^((b // 2) -1))
    
    n = p * q
    phi = (p - 1) * (q - 1)
    
    e = random_prime(phi, 2)
    while gcd(e, phi) != 1:
        e = next_prime(e)
    
    d = inverse_mod(e, phi)
    
    return n, e, d




# sprawdzenie podpisu

# wejście:
# m - wiadomość
# s - podpisana wiadomość
# e - klucz publiczny
# wyjście:
# tf - potwierdzenie podpisu

def sprawdzenie_podpisu(m, s, e, n):
    x = pow(s, e, n)
    print("x", x)
    return (x == m)




# krok 1 
# użytkownik A wybiera losowo k z przedziału (1,n).

# wejście:
# n - moduł
# wyjście:
# k - losowy int

def krok1(n):
    k = randrange(2,n)
    while gcd(n, k) != 1:
        e = randrange(2,n)
    return k




# krok 2
# użytkownik A zaciemnia m obliczając:
# t = mk^e
# Przesyła t do użytkownika B.

# wejście:
# m - wiadomość
# k - losowy int
# e - klucz publiczny
# wyjście:
# t - zaciemniona wiadomość

def krok2(m, k, e):
    t = (m * pow(k, e, n)) % n
    return t




# krok 3
# użytkownik B podpisuje t:
# Przesyła r do użytkownika A.

# wejście:
# t - zaciemniona wiadomość
# d - klucz prywatny
# wyjście:
# r - wynik podpisania zatajnionej wiadomosci

def krok3(t, d):
    r = pow(t, d, n)
    return r





# krok 4
# użytkownik A usuwa zaciemnienie t^d poprzez obliczenie:
# s = r/k
# Podpisem pod wiadomością m jest s.

# wejście:
# r - wynik podpisania zatajnionej wiadomosci
# k - losowy int
# wyjście:
# s - podpis pod wiadomością

def krok4(r, k, n):
    s = (r / k) % n   
    return s




# przykład użycia:
m = 1000
n, e, d = generator_rsa(128)
print("n", n, "\ne", e, "\nd", d)

k = krok1(n)
print("k", k)

t = krok2(m, k, e)
print("t", t)

r = krok3(t, d)
print("r", r)

s = krok4(r, k, n)
print("s", s)

print("podpisane poprawnie?", sprawdzenie_podpisu(m, s, e, n))
