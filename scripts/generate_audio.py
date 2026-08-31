import asyncio
import edge_tts
import os

VOICE = "en-US-JennyNeural"
RATE = "+1%"
PITCH = "+2Hz"

phrases = {
    "phase1_welcome.mp3": "Hey everyone! A super warm welcome to Street Mobile! I'm STREETLA, your friendly virtual shopping assistant, and I'm so excited to launch our all-new store with all of you today! We are always right near you!",
    "phase2_products.mp3": "Looking for the latest flagship smartphones, crystal-clear audio, or authentic accessories? We've got the hottest global brands at unbeatable prices you will absolutely love!",
    "phase3_warranty.mp3": "Every single device comes with official company warranty, fast island-wide delivery, and caring friendly support. From purchase to repair, you can always count on us!",
    "phase4_deals.mp3": "To celebrate our grand launch, enjoy exclusive discount deals, interest-free installment plans, and express doorstep delivery across Sri Lanka. Shopping has never been this easy and fun!",
    "phase5_buildup.mp3": "The wait is finally over, everyone! Get ready to step into the future of shopping. Let's count down together and launch the all-new Street Mobile in 3, 2, 1!",
    "phase_reveal.mp3": "And we are officially live! Welcome to the brand new Street Mobile! I'm STREETLA, your virtual assistant. Whenever you need help finding anything or grabbing our special deals, simply chat with me right at the bottom corner of your screen. Have a wonderful time, and enjoy your shopping!",
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
    print(f"Generating full-bodied studio neural audio using {VOICE}...")
    for filename, text in phrases.items():
        filepath = os.path.join(out_dir, filename)
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(filepath)
        size = os.path.getsize(filepath)
        print(f"  ✓ Generated {filename} ({size:,} bytes)")
    print("All continuous studio launch audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate())
