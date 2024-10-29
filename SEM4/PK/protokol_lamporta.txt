 # Arkadiusz Ostrzyżek
# WCY22KY2S1
# Laboratoria 2.

def rand_bits(length):
    return bytes([randint(0, 255) for _ in range(length)])

def calculate_hmac(key, data):
    h = hmac.new(key, data, hashlib.sha256)
    return h.digest()

# krok 0
# Użytkownicy A i B korzystają wspólnie z tego samego klucza tajnego K

# wejście:
# brak
# wyjście:
# key -  tajny klucz
# nazwaA - nazwa użytkownika A w formie bitowej
# nazwaB - nazwa użytkownika B w formie bitowej

def krok0():
    key = os.urandom(512)
    nazwaA = b"uzytkownik_A"
    nazwaB = b"uzytkownik_B"
    return key, nazwaA, nazwaB

# krok 1
# użytkownik A wybiera liczbę losową RandA i wysyła ją użytkownikowi B

# wejście:
# brak
# wyjście:
# randA - liczba losowa wygenerowana przez użytkwonika A

def krok1():
    randA = os.urandom(512)
    return randA

# krok 2
# użytkownik B wybiera liczbę losową RandB i wysyła ją do użytkownika A wraz z danymi
# RandB, HMACK(RandA, RandB, B) → A

# wejście:
# randA - liczba losowa wygenerowana przez użytkwonika A
# wyjście:
# randB - liczba losowa wygenerowana przez użytkwonika A
# hmacB - rezultat działania HMACK(RandA, RandB, B) wykonanego przez użytkownika B

def krok2(randA):
    randB = os.urandom(512)
    hmacB = calculate_hmac(key, randA + randB + nazwaB)
    return randB, hmacB

# krok 3
# użytkownik A oblicza HMACK(RandA, RandB, B) i porównuje wynik z wartością otrzymaną od B,
# jeśli wartości są identyczne, to użytkownik A ma pewność, że komunikuje
# się z użytkownikiem B, i wysyła do niego wartość HMACK(RandB, A)

# wejście:
# nazwaA - nazwa użytkownika A w formie bitowej
# nazwaB - nazwa użytkownika B w formie bitowej
# randA - liczba losowa wygenerowana przez użytkwonika A
# randB - liczba losowa wygenerowana przez użytkwonika B
# hmacB - rezultat działania HMACK(RandA, RandB, B) wykonanego przez użytkownika B
# wyjście:
# hmacA - rezultat działania HMACK(RandB, A) wykonanego przez użytkownika A

def krok3(nazwaA, nazwaB, randA, randB, hmacB):
    if hmac.compare_digest(hmacB, calculate_hmac(key, randA + randB + nazwaB)):
        hmacA = calculate_hmac(key, randB + nazwaB)
        print("Użytkownik A ma pewność, że komunikuje się z B!")
    else:
        hmacA = None
        print("Użytkownik B podał zły MAC!")
    return hmacA

# użytkownik B oblicza HMACK(RandB, A) i porównuje wynik z wartością otrzymaną od
# A, jeśli wartości są identyczne, użytkownik B ma pewność, że komunikuje się z A

# wejście:
# nazwaA - nazwa użytkownika A w formie bitowej
# nazwaB - nazwa użytkownika B w formie bitowej
# randA - liczba losowa wygenerowana przez użytkwonika A
# randB - liczba losowa wygenerowana przez użytkwonika B
# hmacA - rezultat działania HMACK(RandB, A) wykonanego przez użytkownika A
# wyjście:
# brak

def krok4(nazwaA, nazwaB, randA, randB, hmacA):
    if hmac.compare_digest(hmacA, calculate_hmac(key, randB + nazwaB)):
        print("Użytkownik B ma pewność, że komunikuje się z A!")
    else:
        hmacA = None
        print("Użytkownik A podał zły MAC!")


key, nazwaA, nazwaB = krok0()
randA = krok1()
randB, hmacB = krok2(randA)
hmacA = krok3(nazwaA, nazwaB, randA, randB, hmacB)
krok4(nazwaA, nazwaB, randA, randB, hmacA)
