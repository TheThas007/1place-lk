import asyncio
import edge_tts
import os

VOICE = "en-US-JennyNeural"
RATE = "+2%"
PITCH = "+2Hz"

phrases = {
    "phase1_welcome.mp3": "Hey everyone! A super warm welcome to Street Mobile! I'm STREETLA, and we are always right near you!",
    "phase2_products.mp3": "Explore the latest flagship smartphones, crystal-clear audio, and authentic accessories at the best unbeatable prices!",
    "phase3_warranty.mp3": "Every device comes with official company warranty, fast island-wide delivery, and friendly care you can trust!",
    "phase4_deals.mp3": "Enjoy exclusive launch discounts, interest-free installment plans, and express doorstep delivery across Sri Lanka!",
    "phase5_buildup.mp3": "The wait is finally over! So get ready, everyone! Let's count down together in 3, 2, 1!",
    "phase_reveal.mp3": "And we are officially live! Welcome to the brand new Street Mobile! I'm STREETLA, your virtual assistant. Whenever you need help finding anything, simply chat with me right at the bottom corner of your screen. Have a wonderful time, and enjoy your shopping!",
    "count_10.mp3": "Ten!",
    "count_9.mp3": "Nine!",
    "count_8.mp3": "Eight!",
    "count_7.mp3": "Seven!",
    "count_6.mp3": "Six!",
    "count_5.mp3": "Five!",
    "count_4.mp3": "Four!",
    "count_3.mp3": "Three!",
    "count_2.mp3": "Two!",
    "count_1.mp3": "One!",
}

out_dir = os.path.join("public", "audio", "launch")
os.makedirs(out_dir, exist_ok=True)

async def generate():
    print(f"Generating realistic studio neural audio using {VOICE}...")
    for filename, text in phrases.items():
        filepath = os.path.join(out_dir, filename)
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(filepath)
        size = os.path.getsize(filepath)
        print(f"  ✓ Generated {filename} ({size:,} bytes)")
    print("All studio launch audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate())
