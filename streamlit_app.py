import streamlit as st

from agent import create_ai_agent
from inventory import InventoryManager

st.set_page_config(page_title="Inventory AI Agent", page_icon="📦", layout="wide")

manager = InventoryManager("inventory.db")
agent = create_ai_agent(manager)

st.title("Inventory Management AI Agent")
st.markdown(
    "Use this app to store inventory items, track stock, and ask the AI agent for inventory insights or actions."
)

with st.sidebar:
    st.header("Quick Actions")
    if st.button("Refresh inventory"):
        st.experimental_rerun()
    st.write("Use the main page forms to add, update, or remove items.")

st.header("Current Inventory")
items = manager.list_items()
if items:
    st.table([item.__dict__ for item in items])
else:
    st.info("No inventory items yet. Add one with the form below.")

st.header("Inventory: Add New Item")
with st.form("add_form"):
    name = st.text_input("Name")
    category = st.text_input("Category")
    quantity = st.number_input("Quantity", min_value=0, value=1)
    location = st.text_input("Location")
    notes = st.text_area("Notes", max_chars=200)
    submitted = st.form_submit_button("Add Item")
    if submitted:
        item_id = manager.add_item(name, category, int(quantity), location, notes)
        st.success(f"Added item id {item_id}")
        st.experimental_rerun()

st.header("Inventory: Update Item")
with st.form("update_form"):
    item_id = st.number_input("Item ID", min_value=1, step=1)
    quantity = st.text_input("New Quantity")
    location = st.text_input("New Location")
    notes = st.text_area("New Notes", max_chars=200)
    submitted = st.form_submit_button("Update Item")
    if submitted:
        message = manager.update_item(int(item_id), int(quantity) if quantity else None, location or None, notes or None)
        if message:
            st.success("Item updated.")
        else:
            st.error("Item not found or no changes applied.")
        st.experimental_rerun()

st.header("Inventory: Remove Item")
with st.form("remove_form"):
    remove_id = st.number_input("Remove Item ID", min_value=1, step=1, key="remove_id")
    submitted = st.form_submit_button("Remove Item")
    if submitted:
        removed = manager.remove_item(int(remove_id))
        if removed:
            st.success("Item removed.")
        else:
            st.error("Item not found.")
        st.experimental_rerun()

st.header("AI Agent Inventory Chat")
prompt = st.text_area(
    "Ask the inventory AI agent", 
    value="Search stock for screwdrivers and generate a short restocking recommendation.",
    height=150,
)
if st.button("Ask Agent"):
    if prompt.strip():
        with st.spinner("Thinking..."):
            response = agent.run(prompt)
        st.markdown("**Agent response:**")
        st.write(response)
    else:
        st.warning("Enter a question or instruction for the AI agent.")
