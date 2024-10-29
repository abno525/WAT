# Arkadiusz Ostrzyżek
# WCY22KY2S1 83744
# Protokół dowodu wiedzy dotyczącej log dyskretnego

#  Założenia:
# 1. Użytkownik B chce poznać wartość logarytmu dyskretnego o podstawie a z 
# liczby b w ciele Fp.
# 2. Użytkownik A chce udowodnić użytkownikowi B, że zna on x spełniające
# zależność a^x ≡ b (mod p) gdzie x jest względnie pierwsze z p − 1.
# Liczby a, b i p są znane, a liczba x jest tajna

b = 16
p = random_prime(2^(b-1), 2^b)
F = GF(p)
a = F.gen()
while True:
    x = randrange(2,p)
    if gcd(x, p-1) == 1:
        break
b = pow(a,x,p)

# krok 1
# użytkownik A wybiera liczbę losową r taką, że r jest mniejsze od p − 1, 
# oblicza h =a^r i przesyła je użytkownikowi B

# wejście:
# a - część badanej zależności
# r - losowa liczba
# wyjście:
# h - wynik działania

def krok1(a):
    r = randrange(2,(p-1))
    h = a^r
    return h, r

# krok 2
# użytkownik B przesyła użytkownikowi A losowy bit k

# wejście:
# brak
# wyjście:
# k - losowy bit

def krok2():
    k = randrange(0, 2)
    return k


# krok 3
#  użytkownik A oblicza s =r+kx (mod p−1)
#  i przesyła wynik użytkownikowi B

# wejście:
# r - losowa liczba
# k - losowy bit
# x - sekret
# p - moc zbioru
# wyjście:
# s - wynik działania

def krok3(r, k, x, p):
    s = (r + k*x) % (p - 1)
    return s


# krok 4
# użytkownik B potwierdza, że  a^s = hb^k (mod p)

# wejście:
# h - wynik działania krok1
# b - część badanej zależności
# k - losowy bit
# p - moc zbioru
# wyjście:
# bool - potwierdzenie wiedzy

def krok4(h, b, k, p, s):
    aps = (h*(b^k)) % p 
    if (aps == a^s):
        return True
    else:
        return False


# krok 5
# powtarzane są kroki 1) do 4) t razy

# wejście
# t - ilość powtórzeń
# wyjście
# bool - potwierdzenie wiedzy

def krok5(t):
    for _ in range (t):
        h, r = krok1(a)
        k = krok2()
        s = krok3(r, k, x, p)
        tf = krok4(h, b, k, p, s)
        if (tf == False):
            print("Zakończono z niepowodzeniem!")
        
    print("Zakończono z powodzeniem.")
    return

# Przykładowe działanie:
t = 10
krok5(t)

