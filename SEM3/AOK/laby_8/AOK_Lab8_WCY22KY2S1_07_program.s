.data
tablica_T:      .space  1040
tablica_TB:     .space  856
skladnik:	.double 1770.0
ulamek:		.double 0.77
nr:		.double 7.0
wartosc:	.double 7.7
jeden:		.double 1.0
suma:		.double 0

.text
ld		f2, skladnik
ld		f4, ulamek
ld		f6, nr
ld		f8, jeden

addd 		f10, f10, f2
addd		f10, f10, f4
addd		f10, f10, f6
addi		r1, r0, tablica_T
addi		r2, r0, #130

fill_T:
sd	0(r1), f10
addd	f10, f10, f8
addi	r1, r1, #8
subi	r2, r2, #1
bnez	r2, fill_T


; dane dla fill_TB
addi		r1, r0, tablica_T
addi		r2, r0, tablica_TB
addi		r3, r0, #107


addd  f10, f0, f0

fill_TB:
; dodawanie1
ld f12, 0(r1)
ld f14, 24(r1)
ld f16, 40(r1)

addd f12, f12, f14    ; dodawanie1 w f12
addd f12, f12, f16

; dodawanie2
ld f18, 56(r1)
ld f20, 72(r1)

addd f18, f18, f20    ; dodawanie2 w f18

; mnozenie
ld	f22, wartosc
multd   f24, f22, f12
multd   f24, f24, f18 ; suma mozenia f24

; odejmowanie
ld	f26, 16(r1)
ld	f28, 0(r1)

subd	f26, f26, f28 ; odejmowanie w f26

; dzielenie
divd f30, f24, f26  ; dzielenie w f30


; suma
addd f10, f10, f30


sd 	0(r2), f30
addi	r1, r1, #8
addi 	r2, r2, #8
subi r3, r3, #1
bnez r3, fill_TB

sd suma, f10
trap 0


