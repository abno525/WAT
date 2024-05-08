 
.data
TA: .space 480
TB: .space 440
suma: .double 0

.text
addi r11, r11, #1007
addi r12, r12, #120
add r10, r0, TA

p1:
sw 0(r10), r11
addi r11, r11, #1

addi r10, r10, #4
subi r12, r12, #1

bnez r12, p1

add r9, r0, TB
add r10, r0, r0
add r10, r0, TA
addi r12, r12, #110

p2:
add	r14, r0, r10

addi 	r14, r14, #12
lw	r13, 0(r14)
add 	r15, r15, r13

addi 	r14, r14, #8
lw	r13, 0(r14)
add 	r15, r15, r13

addu 	r14, r14, #8
lw	r13, 0(r14)
add 	r15, r15, r13

addi r13, r0, #100
mult r15, r15, r13
add r7, r7, r15
sw 0(r9), r15
add r15, r0, r0

addi r9, r9, #4
addi r10, r10, #4
subi r12, r12, #1
bnez r12, p2

movi2fp f7, r7
cvti2d f12, f7
sd suma, f12


trap 0
