 # Arkadiusz Ostrzyżek
# WCY22KY2S1
# Laboratoria 1

from sage.crypto.util import random_prime


# 0. Przed przystąpieniem do realizacji protokołu strony A, B, C.
# muszą uzgodnić grupę cykliczną Gn =< g > generowaną przez element g.
# Wymagane jest, aby n było dużą liczbą pierwszą

# b – długość charakterystyki ciała p wyrażona w bitach.
b = 20

while True:
        n = random_prime(2^(b+1))
        p = 2*n+1
        if (is_prime(p)):
            break

A = GF(p)
g = A.random_element(0,p-1)

while not (g^n == 1):
    g -= 1


def generateKey(g, n):
    Xx = ZZ.random_element(1, n-1)
    Yx = g^Xx
    return Xx, Yx


# 1. Strona A generuje losową liczbę całkowitą Xa ∈ Z*n, oblicza
# ya = g^Xa i wysyła Ka do strony B.

Xa, Ya = generateKey(g, n)

# 2. Strona B generuje losową liczbę całkowitą Xb ∈ Z*n, oblicza
# yb = g^Xb i wysyła Kb do strony C.

Xb, Yb = generateKey(g, n)

# 3. Strona C generuje losową liczbę całkowitą Xc ∈ Z*n, oblicza
# yc = g^Xc i wysyła Kb do strony A.

Xc, Yc = generateKey(g, n)

# 4. A oblicza Zca = (Yc)^Xa = (g^Xc)^Xa = g^XcXa
# i wysyła Zca do strony B

Zca = Yc^Xa

# 5. B oblicza Zab = (Ya)^Xb = (g^Xa)^Xb = g^XaXb
# i wysyła Zab do strony C

Zab = Ya^Xb

# 6. C oblicza Zbc = (Yb)^Xc = (g^Xb)^Xc = g^XbXc
# i wysyła Zbc do strony A

Zbc = Yb^Xc

# 7. A oblicza klucz sesyjny
# K = (Zbc)^Xa = (g^XbXc)^Xa = g^XcXbXa

Kbca = Zbc^Xa

# 8. B oblicza klucz sesyjny
# K = (Zca)^Xb = (g^XcXa)^Xb = g^XcXaXb

Kcab = Zca^Xb

# 9. C oblicza klucz sesyjny
# K = (Zab)^Xc = (g^XaXb)^Xc = g^XaXbXc

Kabc = Zab^Xc

print("\n --- Diffie-Hellman na 3 osoby --- \n")
print("xa:", Xa)
print("xb:", Xb)
print("xc:", Xc)
print("ya:", Ya)
print("yb:", Yb)
print("yc:", Yc)
print("zab:", Zab)
print("zbc:", Zbc)
print("zca:", Zca)
print("kabc:", Kabc)
print("kcab:", Kcab)
print("kbca:", Kbca)

print("\n Czy klucze są identyczne? : ", Kabc == Kcab == Kbca)
