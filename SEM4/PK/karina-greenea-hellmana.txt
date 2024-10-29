# Arkadiusz Ostrzyżek
# WCY22KY2S1 83744

# implementacja schematu Karina-Greene'a-Hellmana

# Krok 0 - generacja cienii
# Zaufana strona wybiera losowo elementy macierzy
# Następnie wyznacza n cienii i rozsyła je uczestnikom

# Wejście:
# G - ciało na jakim wykonywane są operacje
# k - ile uczestników musi się dogadać
# n - ilość uczestników
# secret - wiadomość do zaszyfrowania

# Wyjście:
# S - macierz cienii
# A - macierz składająca się z potęgowanego elementu pierwotnego
# M - macierz zawierająca sekret

def krok0(G, k, n, secret):
    
    a = G.primitive_element()
    M = matrix(G, k, 1)
    M[0, 0] = secret                
    for x in range(1, k):
        M[x, 0] = G.random_element()
    
    A = matrix(G, n, k)
    for x in range(n-1):
        A[x, 0] = 1
        
    A[n-1, k-1] = 1
    
    for x in range(n-1):
        for y in range(1, k):
            A[x ,y] = (a^(x+1))^(y+1)
            
    S = A * M
    return S, A, M




# Krok 1
# Tworzenie macierzy składającej się z elementu pierwotnego przez uczestników

# Wejście:
# G - ciało na jakim wykonywane są operacje
# k - ile uczestników musi się dogadać
# n - ilość uczestników
# i - ilość uczestników biorąca udział w odszyfrowaniu

# Wyjście:
# D - macierz składająca się z potęgowanego elementu pierwotnego

def krok1(G, n, k, i):
    
    a = G.primitive_element()
    
    if (i != n):
        
        D = matrix(G, i, i)
        for x in range(i):
            D[x, 0] = 1

        for x in range(i):
            for y in range(1, i):
                D[x ,y] = (a^(x+1))^(y+1)        
    
    if (i == n):
        
        if (n > k):
            D = matrix.identity(G, n)
        else:
            D = matrix.identity(G, k)
            
        for x in range(n-1):
            D[x, 0] = 1

        for x in range(n-1):
            for y in range(1, k):
                D[x ,y] = (a^(x+1))^(y+1)
                
    return D


# Krok 2 
# Wymnażanie odwrotności macierzy a oraz s w celu otrzymania sekretu

# Wejście:
# s - macierz cienii
# a - macierz składająca się z potęgowanego elementu pierwotnego

# Wyjście:
# m - macierz zawierająca sekret

def krok2(a, s):
    m = (a^-1)*s
    return m 


q = 5 # modulo argumentów
m = 2 # stopien wielomianu max
n = 8 # ilosc uczestnikow 
k = 4 # ile uczestnikow musi sie dogadac

G=GF(q**m,"a")
secret = G.random_element()  # do wykomentowania jeśli wiemy co chcemy podac


S, A, M = krok0(G, k, n, secret)

print("\nS:")
print(S)
print("\nA:")
print(A)
print("\nM:")
print(M)


A1 = krok1(G, n, k, 4)

print(A1)
print("\na^-1")
print(A1^-1)


S1 = matrix([S[0,0] , S[1,0], S[2,0], S[3,0]])
S1 = S1.transpose()
M1 = krok2(A1, S1)

print("S1:")
print(S1)
print("\nM1:")
print(M1)

