<script>
export default {
  created() {
    this.$nextTick(() => {
      const { params, query } = this.$route
      const { path } = params
      this.$router.replace({ path: '/' + path, query })
    })
  }
}
</script>

